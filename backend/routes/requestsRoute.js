const express=require('express');
const mongoose=require("mongoose")
const Request=require('../model/Requests');
const Friends=require('../model/friends')
const router=express.Router();



  // API to check if two users are friends
  router.get('/isFriend/:userId/:user1Id', async (req, res) => {
    const userId = req.params.userId;
    const user1Id = req.params.user1Id;
    if (!user1Id || !userId) {
      return res.status(400).json({ error: "Information missing." });
    }
  
    try {
     
      const friends = await Friends.findOne({ userId:userId });
  
      if (!friends) {
        return res.status(200).json({ message: "not friends" });
      }
  
      const friend = friends.friendIds.find(friendId => friendId.equals(user1Id));
  
      if (!friend) {
        return res.status(200).json({ message: "not friends" });
      }
  
    
        return res.status(200).json({ message: "friends" });
  
    } catch (error) {
      return res.status(500).json({ error: "Internal server error." });
    }
  });
  

router.post('/sendReq', async (req, res) => {
    const {msg,senderId,receiverId} = req.body;
  
    if (!senderId|| !receiverId||!msg) {
      return res.status(400).json({ error: "insufficient details" });
    }
    // Check if there is any pending request between the two users
    const existingRequest = await Request.findOne({
      userId: receiverId,
      "requests.sender": senderId,
      "requests.status": "pending",
    });
    //or receiver has sent any request to him
    const existingRequest1 = await Request.findOne({
      userId: senderId,
      "requests.sender": receiverId,
      "requests.status": "pending",
    });
    if (existingRequest) {
      // If there is a pending request, return an error
      return res.status(201).json({ message: "request already pending" });
    }
    if(existingRequest1){
      return res.status(200).json({message:"this person has already sent you a request"});
    }

    //checking that user is already present or this is his first request
    const userIdexists=await Request.findOne({userId:receiverId});
    if(userIdexists){
      const body={
        sender:senderId,
        status:"pending",
        timestamp:Date.now(),
        message:msg
      }
      userIdexists.requests.push(body);
      try {
        // Save the updated document to the database
        await userIdexists.save();
        res.status(200).json({ message: "Friend request sent successfully" });
      } catch (error) {
        console.error("Error saving request:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
    // If no pending request exists, create a new request
    const newRequest = new Request({
      userId: receiverId,
      requests: [{
        sender: senderId,
        status: "pending",
        timestamp: Date.now(),
        message: msg, // Include the message field in the new request
      }],
    });
    const newRequest2= new Request({
      userId: senderId,
      requests: [{
        sender: senderId,
        status: "pending",
        timestamp: Date.now(),
        message: msg, // Include the message field in the new request
      }],
    })
  
    try {
      // Save the new request document to the database
      await newRequest.save();
      await newRequest2.save();
      res.status(200).json({ message: "Friend request sent successfully" });
    } catch (error) {
      console.error("Error saving request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// Assuming you have imported the Requests model



// API endpoint to update the status of a request and delete it if is rejected
// Replace with the actual path to your requests model

router.put('/updateStatus', async (req, res) => {
  const { userId, senderId, status } = req.body;

  if (!userId || !senderId || !status) {
    res.status(400).send("insufficient details");
  }
console.log(userId,senderId);
  try {
    const request = await Request.findOne({ userId:userId, "requests.sender": senderId });

    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    // Find the corresponding request document with the other user
    const otherUserRequest = await Request.findOne({ userId: senderId, "requests.sender": senderId });

    if (!otherUserRequest) {
      return res.status(400).json({ message: "Corresponding request document not found with the other user" });
    }

    // Update the status of the matched request and the corresponding request with the other user
   

    // If the status is "rejected", delete the request documents
    if (status === "rejected") {
       await request.save();
       await otherUserRequest.save();

      await Request.findOneAndDelete({ userId, "requests.sender": senderId });
      await Request.findOneAndDelete({ userId: senderId, "requests.sender": userId });
    }

    // If the status is "accepted", delete the request documents and add documents in the friends collection for both users
    if (status === "accepted") {
          await request.save();
       await otherUserRequest.save();
      await Request.findOneAndDelete({ userId, "requests.sender": senderId });
      await Request.findOneAndDelete({ userId: senderId, "requests.sender": userId });

      // Add to user's friend list
      const userFriend = await Friends.findOne({ userId:userId });
      if (userFriend) {
        userFriend.friendIds.push(senderId);
        await userFriend.save();
      } else {
        await Friends.create({ userId, friendIds: [senderId] });
      }

      // Add to sender's friend list
      const senderFriend = await Friends.findOne({ userId: senderId });
      if (senderFriend) {
        senderFriend.friendIds.push(userId);
        await senderFriend.save();
      } else {
        await Friends.create({ userId: senderId, friendIds: [userId] });
      }
    }
    console.log("accepted successfully");
    return res.status(200).json({ message: "Request status updated successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
});



//fetch all the friend request

  router.get('/getReq/:userId',async (req,res)=>{
    const userId=req.params.userId;
    if(!userId){
      res.status(400).send({error:"insufficient details"});
    }
    try {
      const data = await Request.findOne({ userId: userId }).populate('requests.sender', 'name email');
  
      if (!data || !data.requests) {
        return res.status(200).send([]);
      } else {
        console.log(data.requests);
        return res.status(200).send(data.requests);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      return res.status(500).send({ error: "Internal server error" });
    }
  })

// gett all the friends of user
  router.get('/getFriends/:userId',async(req,res)=>{
    const userId=req.params.userId;
    if(!userId)return res.status(400).send({error:"insufficient details"});
    const data=await Friends.findOne({userId:userId}).populate('friendIds','name email');
    if(!data)return res.status(200).send([]);
    else{
      return res.status(200).send(data.friendIds)
    }
  })
    module.exports=router;
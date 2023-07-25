const express=require('express')
const Chat=require('../model/chatModel');
const User=require('../model/UserModel');
const { protect } = require("../middleware/auth");
const router=express.Router();

//fetch one on one chats or create it
router.post('/accessChat',async(req,res)=>{
    const { userId,currUserId } = req.body;
    console.log(req.body);
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }
  
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: currUserId } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
  
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
  
    if (isChat.length>0) {
      res.send(isChat[0]);
    } else {
       
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [currUserId, userId],
      };
  
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
       
        res.status(200).json(FullChat);
      } catch (error) {
        res.status(400).json({message:`${error} occured`});
      }
    }
})

//fetch all the chats related to user

router.get('/fetchChats/:userId', async (req, res) => {
  const userId = req.params.userId;
  

  Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
      res.status(200).send(results);
    })
    .catch((error) => {
      res.status(400);
      return res.status(400).json({message:`${error} occured`});
    });
});

  
//creating group chat
router.post('/createGroupChat',async (req,res)=>{
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
      }
    
      var users = JSON.parse(req.body.users);
    
      if (users.length < 2) {
        return res
          .status(400)
          .send("More than 2 users are required to form a group chat");
      }
    
      users.push(req.user);
    
      try {
        const groupChat = await Chat.create({
          chatName: req.body.name,
          users: users,
          isGroupChat: true,
          groupAdmin: req.user,
        });
    
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
          .populate("users", "-password")
          .populate("groupAdmin", "-password");
    
        res.status(200).json(fullGroupChat);
      } catch (error) {
        res.status(400).json({message:`${error} occured`});
      }
})

//renaming the groups
router.put('/renameGroup',async (req,res)=>{
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!updatedChat) {
      res.status(404).json({message:"Chat Not Found"});
    } else {
      res.json(updatedChat);
    }
});

//adding to group

router.put('/addMember',async (req,res)=>{
    const{chatId,userId}=req.body;
    const chat = await Chat.findById(chatId);
    if (chat.users.includes(userId)) {
      return res.status(400).send("User already a member of the chat");
    }
    const added=await Chat.findByIdAndUpdate(
        chatId,
        {
            $push:{users:userId}    
        },{
            new:true
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")

    if(!added){
        res.status(400).send("user not added");
    }
    else{
        res.status(200).json(added);
    }
})

router.put('/removeMember',async(req,res)=>{
    const {chatId,userId}=req.body;
    const deleted=await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull:{users:userId}    
        },{
            new:true
        }
    )
})

router.get('/getUsers/:chatId',async(req,res)=>{
  const chatId=req.params.chatId;

  const chat=await Chat.findById(chatId).populate('users');
  if(chat){
    return res.status(200).json(chat.users);
  }
  else{
    res.status(400).json({error:"no chat has been found with such id"});
  }
})

module.exports=router;
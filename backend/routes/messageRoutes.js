const express=require('express');
const Message=require('../model/message');
const User=require('../model/UserModel');
const Chat=require('../model/chatModel')
const router=express.Router();

// api to send new messages
router.post('/sendMessage',async(req, res) => {
    const { content, chatId ,userId} = req.body;
    console.log(chatId);
    if (!content || !chatId) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }
  
    var newMessage = {
      sender: userId,
      content: content,
      chat: chatId,
    };
  
    try {
      var message = await Message.create(newMessage);
  
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });
  
      await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
  
      res.json(message);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });


  router.get('/getMessages/:chatId', async (req, res) => {
    try {
      const chatId=req.params.chatId;
      const messages = await Message.find({ chat: chatId})
        .populate("sender", "name pic email")
        .populate("chat");
      res.json(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });
  
module.exports=router;
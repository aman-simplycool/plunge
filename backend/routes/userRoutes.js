const express=require("express");
const User=require("../model/UserModel");
const generateToken=require('../config/generateToken');
const { protect } = require("../middleware/auth");
const router=express.Router();
router.post('/register',async (req,res)=>{
    const { name, email, password, pic } = req.body;
  
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the Feilds");
    }

    const emailDomain = email.split("@")[1];
    if (emailDomain !== "akgec.ac.in") {
      return res.status(400).json({ message: "Registration is allowed only for @akgec.ac.in email addresses" });
    }
  
    const userExists = await User.findOne({email});
  
    if (userExists) {
      res.status(400);
      console.log("User already exists");
      throw new Error("User already exists");
    }
  
    const user = await User.create({
      name,
      email,
      password,
      pic
    });
  
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      });
      console.log(user);
    } else {
      res.status(400);
      console.log("User Not found");
      throw new Error("User not found");
    }
})


//login api
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const tempUser = await User.findOne({ email });
  if (tempUser) {
    if (await tempUser.matchPassword(password)) {
      console.log("Login Successful");
      res.json({
        _id: tempUser._id,
        name: tempUser.name,
        email: tempUser.email,
        isAdmin: tempUser.isAdmin,
        pic: tempUser.pic,
        token: generateToken(tempUser._id),
      });
    } else {
      console.log("Password is invalid");
      res.status(400).send("Password is invalid");
    }
  } else {
    console.log("User not registered");
    res.status(400).send("User not registered");
  }
});


//get any User

router.get('/allUsers',protect,async (req,res)=>{
  const keyword=req.query.search 
  ?{
    $or: [
      {name:{$regex:req.query.search,$options:"i"}},
      {email:{$regex:req.query.search,$options:"i"}}
    ],
  }:{}
  const users=await User.find(keyword).find({_id:{ $ne: req.user._id}});
  res.send(users);
})

//get info about any user
router.get('/getUser/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports=router;
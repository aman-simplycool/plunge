const express=require("express");
const User=require("../model/UserModel");
const generateToken=require('../config/generateToken');
const { protect } = require("../middleware/auth");
const router=express.Router();
router.post('/register',async (req,res)=>{
    const { name, email, password, img } = req.body;

  
    if (!name || !email || !password) {
      
      return res.status(400).json({message:"Please Enter all the Fields"});
    }

    const emailDomain = email.split("@")[1];
    if (emailDomain !== "akgec.ac.in") {
      return res.status(400).json({ message: "Registration is allowed only for @akgec.ac.in email addresses" });
    }
  
    const userExists = await User.findOne({email});
  
    if (userExists) {  
      console.log("User already exists");
      return res.status(400).json({message:"user already exists"})
    }
  
    else{
      const user = await User.create({
      name,
      email,
      password,
      pic:img
    });
  
    if (user) {
     return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      
      console.log("User Not found");
     return res.status(400).json({message:"user not found"})
    }
  }
})


//login api
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email||!password){
    return res.status(400).json({message:"please give both the details"});
  }
  const tempUser = await User.findOne({ email });
  if (tempUser) {
    if (await tempUser.matchPassword(password)) {
      console.log("Login Successful");
     return  res.json({
        _id: tempUser._id,
        name: tempUser.name,
        email: tempUser.email,
        isAdmin: tempUser.isAdmin,
        pic: tempUser.pic,
        token: generateToken(tempUser._id),
      });
    } else {
      console.log("Password is invalid");
     return res.status(400).json({message:"Password is invalid"});
    }
  } else {
    console.log("User not registered");
    return res.status(400).send({message:"User not registered"});
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
  return res.status(200).send(users);
})

//get info about any user
router.get('/getUser/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports=router;
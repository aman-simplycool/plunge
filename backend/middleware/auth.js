const jwt=require('jsonwebtoken');
const User=require('../model/UserModel');
const asynchandler=require('express-async-handler');

const protect=asynchandler(async (req,res,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try{
            token=req.headers.authorization.split(" ")[1];

            //decodes
            const decoded=jwt.verify(token,process.env.JWT_SECRET)
            req.user=await User.findById(decoded.id).select("-password")
            next();
        }
        catch(err){
            res.status(401).json({message:err})
        }
    }
    if(!token){
        res.status(401).json({message:"Not authorized no token"});
    }
})
module.exports={protect}
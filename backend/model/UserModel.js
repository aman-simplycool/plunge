const mongoose=require("mongoose");
const bcrypt=require('bcryptjs')
const userModel=mongoose.Schema({
    name:{type:String,trim:true},
    email:{type:String,trim:true,unique:true},
    password:{type:String,trim:true},
    pic:{
        type:String,
    },
  
},
{
    timestamp:true
}

)
userModel.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

userModel.pre('save', async function(next) {
    if (!this.isModified) {
      next();
    } else {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    }
  });
  



const User=mongoose.model("User",userModel);
module.exports=User;
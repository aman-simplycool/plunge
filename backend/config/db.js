const mongoose=require("mongoose");

const DB=async()=>{
    try{    
        const conn=await mongoose.connect("mongodb+srv://aman:atlaskicycle@cluster0.as0ic.mongodb.net/?retryWrites=true&w=majority",{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log(`connection has been set up ${conn.connection.host}`);
    }
    catch(err){
        console.log(`${err.message} occured while connecting to MONGO DB`);
    }
}
module.exports=DB;
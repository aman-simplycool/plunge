const NotFound=async (req,res,next)=>{
const error=new Error(`Not Found - ${req.originalUrl}`)
res.status(400);
next(error);
}
const errorHandler=async(err,req,res,next)=>
{
    const statuscode=res.statusCode===200?500:res.statusCode;
    res.status(statuscode).json({
        message:err.message,
        stack:process.env.NODE_ENV === "production" ? null: err.stack
    });;
    if (res.headersSent) {
        return next(err);
      }
}
module.exports={NotFound,errorHandler};
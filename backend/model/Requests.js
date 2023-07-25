const mongoose=require('mongoose')
const requestsSchema = mongoose.Schema({
    userId: {
      type: String,
      required: true,
    },
    requests: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        message:{
          type:String,
          required:true
        },
        timestamp: {
          type: Date,
          default: Date.now,
          expires: '24h'
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
  });
  
  const Requests = mongoose.model('Requests', requestsSchema);
    module.exports=Requests;  
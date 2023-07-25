const express=require("express")
const dotenv=require("dotenv")
const DB=require('./config/db')
const cors = require('cors');
const userRoutes=require('./routes/userRoutes')
const chatRoutes=require('./routes/chatRoutes')
const MessageRouter=require("./routes/messageRoutes");
const requestRouter=require("./routes/requestsRoute");
const { NotFound,errorHandler} = require("./middleware/errorMiddleware")
const { protect } = require("./middleware/auth")
const path = require('path');
dotenv.config();

DB();

const app=express();
app.use(express.json());

app.use(cors());
app.use("/api/user",userRoutes);
app.use("/api/chat",protect,chatRoutes);
app.use("/api/message",protect,MessageRouter);
app.use("/api/request",protect,requestRouter);
// app.use(NotFound);
// app.use(errorHandler);
const PORT=process.env.PORT;




if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend', 'dist', 'frontend')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'frontend', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running..');
  });
}


const server=app.listen(PORT,console.log(`server is running at port ${PORT}`));
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:4200",
      
    },
  });
  

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    let userData; // Define userData variable
    socket.on("setup", (id) => {
       // Assign data to userData variable
      socket.join(id);
      socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });
  
    socket.on("typing", (room) => socket.in(room).emit("istyping",room));
    socket.on("stop typing", (room) => socket.brodcast(room).emit("stop typing"));
    

    socket.on("new message", (newMessageReceived) => {
      var chat = newMessageReceived.chat;
      console.log("new message");
      io.in(newMessageReceived.chat._id).emit("message received",newMessageReceived);
    
      
     });
    //  socket.on("room for friend request",(senderId,receiverId)=>{
    //   const roomId = `${senderId}-${receiverId}`;
    //   socket.join(roomId);
    //   console.log("room joined for requests");
    //   socket.emit("connected");
    // })  

   
    var roomId,rId;
    socket.on("request sent",(body)=>{
      const{req,receiverId}=body;
      rId=receiverId;
      const roomName=`${req.sender._id}-${receiverId}`;
      roomId=roomName;
       // Emit a "join room" event to both the sender and receiver sockets
      socket.join(roomName);
      console.log(roomName);      
    })
    socket.emit("join room", roomId,rId);
    socket.on('leave room', (roomId) => {
      // Use the leave method to make the socket leave the room
      socket.leave(roomId);
      console.log(`Socket with ID ${socket.id} left room ${roomId}`);
    });


  socket.emit("request accepted",(body)=>{
    const {room,name}=body;
    socket.in(room).emit("request accepted",()=>{
      return name;
    })
  })  

  socket.emit("request rejected",(room,name)=>{
    socket.in(room).emit("request rejected",()=>{
      return `request rejected by ${name}`;
    })
  })  
  
  });
  
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Socket,io } from 'socket.io-client';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
url:string="http://localhost:5000";  
private socket=io(this.url);
joinRoom(id:string){
  this.socket.emit('setup',id)
}

joinRoom2(senderId:string,receiverId:string){
  this.socket.emit('room for friend request',senderId,receiverId);
}

sendMessage(message:any){
  this.socket.emit('new message',message);

}
newMessageReceived(){
  let observable= new Observable<any>(observer=>{
    this.socket.on("message received",(data)=>{
      observer.next(data);
    });
    return ()=>{
      this.socket.disconnect();
    }
  });
  return observable;
}

someoneTyping(id:any){
this.socket.emit("typing",id);
}

isSomeoneTyping(){
  let observable=new Observable<any>(observer=>{
    this.socket.on("istyping",(data)=>{
      console.log(data);
      observer.next(data);
    });
    return ()=>{
      this.socket.disconnect();
    }
  });
  return observable;
}

stopedTyping(id:any){
  this.socket.on('stop typing',id);
}

joinRoomReq(id:string){
let observable=new Observable<any>(observer=>{
  this.socket.on("join room",(data)=>{
    const{roomId}=data;
  
      console.log(roomId);
    observer.next(roomId);
    
  })
  return ()=>{
    this.socket.disconnect();
  }
});
return observable;
}

isThereAnyRequest(){
  let observable=new Observable<any>(observer=>{
    this.socket.on("request arrived",(data)=>{
      observer.next(data);
    });
    return ()=>{
      this.socket.disconnect();
    }
  });
  return observable;
}

isRequestRejected(){
  this.socket.emit('request rejected',name);
}

reqGotAcc(){
let observable=new Observable<any>(observer=>{
  this.socket.on("request accepted",(data)=>{
    console.log(data);
    observer.next(data);
  })
  return ()=>{
    this.socket.disconnect();
  }
});
return observable;
}

reqGotRej(){
  let observable=new Observable<any>(observer=>{
    this.socket.on("request rejected",(data)=>{
      console.log(data);
      observer.next(data);
    })
    return ()=>{
      this.socket.disconnect();
    }
  });
  return observable;
  }



reqAccept(room:any,name:string){
  this.socket.emit("request accepted",{room,name});
}
reqReject(room:any,name:string){
  this.socket.emit("request rejected",{room,name});
}

reqSent(receiverId:string,req:any){
  this.socket.emit('request sent',{req,receiverId});
}

}

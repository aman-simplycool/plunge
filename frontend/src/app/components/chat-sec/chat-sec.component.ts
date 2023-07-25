import { HttpHeaders } from '@angular/common/http';
import { Component, OnChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { HotToastService } from '@ngneat/hot-toast';
import { io, Socket } from 'socket.io-client';
import { Observable, Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
@Component({
  selector: 'app-chat-sec',
  templateUrl: './chat-sec.component.html',
  styleUrls: ['./chat-sec.component.css'],
})
export class ChatSecComponent {
  private typingTimeout: any;
  constructor(
    private chatService: ChatService,
    private service: HttpService,
    private router: Router,
    private toast: HotToastService
  ) {
    //any new message received
    this.chatService.newMessageReceived().subscribe((res) => {
      this.temparrChat2.push(res);
      const message=(`${res.sender.name} sent you a message`);
      this.tempMsgArr.push(message);
      const lastIndex = this.tempMsgArr.length - 1;
      this.removeAfter10Hours(lastIndex);
      this.allChats.forEach((chat) => {
        if (chat._id == this.chatId) {
          chat.latestMessage = res._id;
        }
      });
    });
    //listening for someone typing
    this.chatService.isSomeoneTyping().subscribe((res) => {
      this.isSomeoneTyping = true;

      clearTimeout(this.typingTimeout);

      // Set a new timeout to reset the isSomeoneTyping variable
      this.typingTimeout = setTimeout(() => {
        this.isSomeoneTyping = false;
      }, 4000);
    });

    // this.chatService.joinRoomReq(this.userId).subscribe((res) => {
    //   console.log('joined the room' + res);
    //   console.log('hello');
    // });

    // this.chatService.isThereAnyRequest().subscribe((res) => {
    //   this.friends.push(res);
    // });

    //  this.chatService.reqGotAcc().subscribe((res)=>{
    //     this.tempMsgArr.push(res);
    //     const lastIndex = this.tempMsgArr.length - 1;
    //     this.removeAfter10Hours(lastIndex);
    //  })
    //  this.chatService.reqGotRej().subscribe((res)=>{
    //   this.tempMsgArr.push(res);
    //     const lastIndex = this.tempMsgArr.length - 1;
    //     this.removeAfter10Hours(lastIndex);
    //  })
  }

  async ngOnInit(): Promise<void> {
    await this.getChats();
    await this.getNotifications();
    await this.getFriends();
  }
  private chatSubscription: Subscription | undefined;

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  removeAfter10Hours(index: number) {
    setTimeout(() => {
      this.tempMsgArr.splice(index, 1); // Remove the message from the array
    }, 10 * 60 * 60 * 1000); // 10 hours in milliseconds
  }

  joinRoom(chatId: string) {
    chatId = this.chatId;

    this.chatService.joinRoom(chatId);
  }
  // joinRoom2(senderId:string,receiverId:string){
  //   this.chatService.joinRoom2(senderId,receiverId);
  // }

  userId: string = '';
  token: string = '';
  allChats: any[] = [];
  tempArr1: any[] = [];
  userInfo2: any = [];
  server: string = 'http://localhost:5000';
  async getChats() {
    var userInfo = localStorage.getItem('userInfo');
    console.log(userInfo);

    if (userInfo) {
      const parsedObject: { token: string } = JSON.parse(userInfo);
      this.userInfo2 = JSON.parse(userInfo);
      this.userId = this.userInfo2._id;
      this.token = parsedObject.token;
    } else {
      console.log('user not logged in');
      this.router.navigate(['']);
    }

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );

    this.service
      .getData('fetchChats', headers, this.userId)
      .subscribe((res) => {
        res.forEach((data: any) => {
          this.allChats.push(data);
          this.tempArr.push(data);
        });

        console.log(this.allChats);
      });
  }

  id: string = '';
  //user that is the counterpart in the chat
  otherName: string = '';
  getSender(Users: any) {
    return (this.otherName =
      Users[0]._id == this.userId ? Users[1].name : Users[0].name);
  }
  friends: any[] = [];
  async getFriends() {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );
    this.service.getRequests('getFriends', headers, this.userId).subscribe({
      next: (res) => {
        this.friends = res;
        console.log(this.friends);
      },
      error: (err) => {
        this.toast.error('could not load your firends list');
      },
    });
  }

  //search user

  filteredChats: any[] = [];
  users: any[] = [];
  async searchUser(event: any) {
    var data = event.target.value;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );
    this.service
      .userGetData(`allUsers?search=${data}`, headers)
      .subscribe((res) => {
        this.users = res;
      });
    console.log(this.users);
  }

  // Declare a variable to hold the friend status
  isFriendStatus: boolean = false;

  // Modify the isFriend function to manually subscribe
  friendStatusChecked: boolean = false;
  async isFriend(userId:any): Promise<boolean> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      }),
    };

    return new Promise<boolean>((resolve, reject) => {
      this.service
        .checkFriend('isFriend', httpOptions.headers, this.userId, userId)
        .subscribe({
          next: (res) => {
            if (res.message === 'friends') {
              this.isFriendStatus=true;
              console.log(this.isFriendStatus);
              
              resolve(true);
            } else {
              resolve(false);
            }
            this.friendStatusChecked = true;
          },
          error: (error) => {
            console.error('Error checking friend status:', error);
            this.friendStatusChecked = true;
            reject(error);
          },
        });
    });
  }

  isSearchActivated: boolean = false;
  tempArr: any[] = [];
  async filterChats(event: any) {
    var searchQuery = event.target.value;
    if (searchQuery.length === 0) {
      this.allChats = this.tempArr;
      this.isSearchActivated = false;
      console.log(this.allChats);
    } else {
      const headers = new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.token}`
      );
      this.service
        .userGetData(`allUsers?search=${searchQuery}`, headers)
        .subscribe((res) => {
          this.allChats = res;
          console.log(this.allChats);
          this.isSearchActivated = true;
        });
    }
  }

  // modal section
  tempGrpUser: any[] = [];
  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  isUserSelected(user: any): boolean {
    return this.tempGrpUser.some(
      (selectedUser) => selectedUser._id === user._id
    );
  }

  async addMember(user: any) {
    var alert = this.toast.loading('adding members');
    if (!this.isUserSelected(user)) {
      this.tempGrpUser.push(user);
    }
    alert.close();
    this.toast.success('added member');
  }

  chatName: string = '';
  deselectUser(user: any) {
    const index = this.tempGrpUser.findIndex(
      (selectedUser) => selectedUser._id === user._id
    );
    if (index !== -1) {
      this.tempGrpUser.splice(index, 1);
    }
  }

  async createGroup() {
    const reqBody = {
      users: JSON.stringify(
        this.tempGrpUser.map((u) => {
          u._id;
        })
      ),
      name: this.chatName,
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`, // Replace `yourToken` with your actual token value
      }),
    };
    this.service
      .sendChatData(reqBody, 'createGroupChat', httpOptions.headers)
      .subscribe({
        next: (response) => {
          console.log('Group chat created successfully:', response);
          this.toast.success('group chat created');
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating group chat:', error);
          this.toast.error('some error occured while creating the group');
          this.closeModal();
        },
      });
  }

  //chat window for selected chat
  selectedChat: string = '';
  isgroupChat: boolean = false;
  chatId: string = '';
  //for showing tha chats of the chat selected
  temparrChat2: any[] = [];
  isUserAdmin: boolean = false;
  grpAdminId: string = '';
  userSelId: string = '';

  //// Function to open the modal
  isModal5Open: boolean = false;
  preMadeMessages: string[] = [
    "Hi, let's be friends!",
    'Looking forward for some collaboration in project!',
    'i found you very pretty',
    'want some carrer guidance',
    'want to go on a date with you',
  ];
  tryMessage: string = '';
  openModal5() {
    this.isModal5Open = true;
  }

  // Function to close the modal
  closeModal5() {
    this.isModal5Open = false;
  }
  //function for sending the request to any user

  //selcting the reason first
  async selectMessage(message: string) {
    this.tryMessage = message;
    console.log(this.tryMessage);
  }

  async acceptRequest(notification: any) {
  
    var data = {
      userId: this.userId,
      senderId: this.userSelId,
      status: 'accepted',
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      }),
    };

    // const roomId = `${notification.sender._id}-${this.userId}`;
    this.service
      .changeStatus('updateStatus', httpOptions.headers, data)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.toast.success('accepted request');
          // this.chatService.reqAccept(roomId, this.userInfo2.name);
          const index = this.requestArr.findIndex(
            (request) => request._id === notification._id
          );
          // If the notification is found, remove it from requestArr using splice
          if (index !== -1) {
            this.requestArr.splice(index, 1);
          }
        },
        error: (err) => {
          console.log(err);
          this.toast.error('some internal error occured');
        },
      });
  }

  //to reject the request

  async rejectRequest(notification: any) {
  
    var data = {
      userId: this.userId,
      senderId: this.userSelId,
      status: 'rejected',
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      }),
    };
    // const roomId = `${notification.sender._id}-${this.userId}`;
    this.service
      .changeStatus('updateStatus', httpOptions.headers, data)
      .subscribe({
        next: (res) => {
          this.toast.success('rejected request');
          // this.chatService.reqAccept(roomId, this.userInfo2.name);
          const index = this.requestArr.findIndex(
            (request) => request._id === notification._id
          );
          // If the notification is found, remove it from requestArr using splice
          if (index !== -1) {
            this.requestArr.splice(index, 1);
          }
        },
        error: (err) => {
          console.log(err);
          this.toast.error('some internal error occured');
        },
      });
  }
  async sendReq() {
    const roomId = `${this.userId}-${this.userSelId}`;
    if (!this.tryMessage) {
      this.toast.error('please select message');
      return;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      }),
    };
    var data = {
      msg: this.tryMessage,
      senderId: this.userId,
      receiverId: this.userSelId,
    };
    console.log(data);
    var body = {
      sender: {
        _id: this.userId,
        name: this.userInfo2.name,
        email: this.userInfo2.email,
      },
      message: this.tryMessage,
      timestamp: new Date(),
      status: 'pending',
    };
    // this.chatService.reqSent(this.userSelId, body);
    this.toast.success('sent request');
    this.closeModal5();
    this.service.sendReq('sendReq',httpOptions.headers,data).subscribe(
      {
        next:(res)=>{
          if(res.message==="request already pending"){
            this.toast.error("already a request is there");
            return;
          }
          else if(res.message==="this person has already sent you a request"){
            this.toast.show("this person has already sent you a request");
            return;
          }
          else {
            this.toast.success("request sent succesfully");
            this.closeModal5();
            return;
          }
        },
        error:(err)=>{

          console.log(err);
          this.toast.error(err +"this is coming");

      }
      }
    )
  }

  isVerified: boolean = false;
  async selectChat(chat: any) {

    var userId: any;
    var flag=0;
    if (this.isSearchActivated) {
      flag=1;
      this.selectedChat = chat.name;
      userId = chat._id;
      this.userSelId = chat._id;
      this.isFriendStatus = await this.isFriend(userId);
    } else {
      if (chat.isGroupChat) {
        this.selectedChat = chat.chatName;
        this.isgroupChat = true;
        this.grpAdminId = chat.groupAdmin._id;
        if (chat.groupAdmin._id == this.userId) {
          this.isUserAdmin = true;
        }
      } else {
        this.chatId=chat._id;
        await chat.users.forEach((user: any) => {
          if (user._id != this.userId) {
            userId = user._id;
            this.selectedChat = user.name;
          }
        });
        
      }
    }
   
    if (flag==1 && !this.friendStatusChecked) {
      // Wait for a brief moment (you can adjust the time if needed)
      await new Promise((resolve) => setTimeout(resolve, 5000));
      // Check again if the friend status has been updated
    }

    

    // Proceed based on the friend status flag
    if (flag==1 && this.isFriendStatus === false) {
      // If user is not a friend, open Modal 5 and return early
      this.openModal5();
      this.selectedChat = '';
      //you created a room for both users
      return;
    } else {
      this.isVerified = true;
      this.joinRoom(this.chatId);

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        }),
      };

      var data = {
        userId: userId,
        currUserId: this.userId,
      };

      
        const result = this.service
          .createChat('accessChat', httpOptions.headers, data)
          .subscribe({
            next: (res) => {
              console.log('Chat created or retrieved successfully:', res);
              this.chatId=res._id;
              console.log(this.chatId);
            },
            error: (error) => {
              console.error('Error creating or retrieving chat:', error);
              // Handle the error
            },
          });
      
      this.chatSubscription = this.service
        .getChats('getMessages', httpOptions.headers, this.chatId)
        .subscribe((res) => {
          console.log(res);
          this.temparrChat2 = res;
          console.log(this.temparrChat2);
        });
      // getting all the members of the group
     if(chat.isGroupChat)
     { this.service
        .getData('getUsers', httpOptions.headers, this.chatId)
        .subscribe({
          next: (res) => {
            this.allUsersOfgrp = res;
            console.log(this.allUsersOfgrp);
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    }
  }

  //function to open modal for group updation

  isModal2Open: boolean = false;
  updatedChatName: string = '';
  allUsersOfgrp: any[] = [];

  async openModal2() {
    console.log(this.friends);
    console.log(this.users2);
    this.isModal2Open = true;
  }

  async closeModal2() {
    this.isModal2Open = false;
  }

  updatedGroupName: string = '';

  async updateGroup() {
    const data = {
      chatId: this.chatId,
      chatName: this.updatedGroupName,
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`, // Replace `yourToken` with your actual token value
      }),
    };

    this.service
      .renameGroup('renameGroup', httpOptions.headers, data)
      .subscribe((res) => {
        this.toast.success('successfully changed group name');
      });

    this.tempGrpUser2.forEach((user) => {
      this.service
        .addMember('addMember', httpOptions.headers, user)
        .subscribe((res) => {
          this.toast.success('finally added your friends');
          this.allChats.splice(0, this.allChats.length);
          this.ngOnInit();
        });
    });
  }

  //Line no 68 function same implementaion
  users2: any[] = [];
  isanyMemSelected: boolean = false;

  async searchUser2(event: any) {
    const searchText = event.target.value.toLowerCase().trim();

    // Filter the friends array based on the search input
    this.users2 = this.friends.filter((friend) => {
      const name = friend.name.toLowerCase();
      const email = friend.email.toLowerCase();

      return name.includes(searchText) || email.includes(searchText);
    });
  }
  //adding new member to the existing group

  tempGrpUser2: any[] = [];

  async isUserSelected2(user: any) {
    console.log(user);
    console.log(this.allUsersOfgrp);

    if (this.allUsersOfgrp.some((id) => id === user._id)) return 1;
    if (this.tempGrpUser2.some((u) => u._id == user._id)) return 2;
    else return 3;
  }

  async addMember2(user: any) {
    var alert = this.toast.loading('adding members');
    var val = await this.isUserSelected2(user);
    if (val == 3) {
      this.tempGrpUser2.push(user);
      this.toast.success('added member');
    } else if (user._id == this.userId) {
      this.toast.error('you are already a part of this group');
    } else if (val == 2) {
      this.toast.error('person already added');
    } else {
      this.toast.error('this member is already a part of group');
    }
    alert.close();
  }

  async deselectUser2(user: any) {
    const index = this.tempGrpUser2.findIndex(
      (selectedUser) => selectedUser._id === user._id
    );
    if (index !== -1) {
      this.tempGrpUser2.splice(index, 1);
    }
  }

  message: string = '';

  //is Someone typing
  isSomeoneTyping: boolean = false;
  async typing() {
    console.log('typing');

    this.chatService.someoneTyping(this.chatId);
  }

  async sendMessage() {
    const data = {
      content: this.message,
      chatId: this.chatId,
      userId: this.userId,
    };
    console.log(data);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      }),
    };
    const res = this.service
      .sendChats('sendMessage', httpOptions.headers, data)
      .subscribe((result) => {
        console.log(result);
        this.chatService.sendMessage(result);
      });
    this.message = '';
  }

  async logOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  showModal3: boolean = false;

  openModal3() {
    this.showModal3 = true;
  }

  closeModal3() {
    this.showModal3 = false;
  }

  isModal4Open: boolean = false;
  openModal4() {
    this.isModal4Open = true;
  }
  closeModal4() {
    this.isModal4Open = false;
  }

  //notifications work starts//
  requestArr: any[] = [];
  tempMsgArr: any[] = [];
  async getNotifications() {
    const httpOption = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`, // Replace `yourToken` with your actual token value
      }),
    };

    this.service
      .getRequests('getReq', httpOption.headers, this.userId)
      .subscribe({
        next: (res) => {
          this.requestArr = res;
          this.requestArr = this.requestArr.filter(
            (request) => request.sender._id !== this.userId
          );
        },
        error: (error) => {
          this.toast.error(
            `there is this ${error} coming while fetching the requests`
          );
        },
      });
  
  }
  //when some body notices the message(either acceptance or rejection) then it must get removed
  Ok(index: number) {
    this.tempMsgArr.splice(index, 1); // Remove the message from the array
  }

  //modal 6 works start
  isModal6Open: boolean = false;
  async openModal6() {
    this.isModal6Open = true;
  }

  async closeModal6() {
    this.isModal6Open = false;
  }

  getType(value: any): string {
    return typeof value;
  }
}

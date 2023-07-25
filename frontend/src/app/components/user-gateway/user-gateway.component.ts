import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { getDownloadURL, ref, Storage, uploadBytes, deleteObject } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { Subscription } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-user-gateway',
  templateUrl: './user-gateway.component.html',
  styleUrls: ['./user-gateway.component.css']
})
export class UserGatewayComponent {
  
  constructor(
    private storage:Storage,
    private router:Router,
    private httpservice:HttpService,
    private toast:HotToastService
    
  ) { }
async ngOninit(){

}


userDetails=new FormGroup({
  name:new FormControl(""),
  email:new FormControl(""),
  password:new FormControl(""),
  img:new FormControl("")
})
img_name:string=""; 
file:any={};
imgUrl:string="";
flag1:boolean=false;
async selectImage($event: any) {
  this.flag1 = true;
  // if ($event.target.files && $event.target.files.length > 0) {
  //   this.file = $event.target.files[0];
  //   this.img_name = this.file.name;
  //   console.log(this.file);
  // }
  this.file=$event.target.files[0];
  this.img_name=$event.target.files[0].name;
}

async uploadImage() {
  if (this.flag1 === true) {
    if (
      this.userDetails.value.name === "" ||
      this.userDetails.value.email === "" ||
      this.userDetails.value.password === ""
    ) {
      alert("Please enter all the fields");
      return;
    } else {
      // Create a reference to the storage location where you want to upload the image
      const storageRef = ref(this.storage, "UserImages" + "/" + this.img_name);

      try {
        // Upload the image file to the storage location
        console.log(this.img_name);
        const snapshot = await uploadBytes(storageRef, this.file);

        // Get the download URL of the uploaded image
        await uploadBytes(storageRef, this.file).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            this.imgUrl = url;
          });
        });
        

        alert("Successfully uploaded");
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading the image");
      }
    }
  } else {
    this.toast.error("Please first select the file");
  }
}




async sendData(){
  alert("saving info")
  this.userDetails.value.img=this.imgUrl;
  const data=this.userDetails.value;
  (this.httpservice.sendData(data, 'register')).subscribe({
    next:(res)=>{ console.log(res)
      localStorage.setItem("user-info",JSON.stringify(data))
      this.toast.success("registered sucessfully");
      this.router.navigate(['/login']);
    },
    error: (error) => {
      console.error(error);
      if (error.status === 400) {
        
        if (error.error.message === "User already exists") {
          
          this.toast.error("User already exists. Please use a different email.");
        } else if (error.error.message === "Please Enter all the Fields") {
          
          this.toast.error("Please enter all the required fields.");
        } else if (error.error.message === "Registration is allowed only for @akgec.ac.in email addresses") {
          
          this.toast.error("Registration is allowed only for @akgec.ac.in email addresses.");
        } else {
         
          this.toast.error("An error occurred during registration. Please try again later.");
        }
      } else {
        
        this.toast.error("An unexpected error occurred. Please try again later.");
      }
    }  
    })
}

//login function
async navigateToLogin(){
  this.router.navigate(['/login'])
}

}

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
  console.log(this.img_name);
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
        var pop1=this.toast.loading("please wait for few seconds till we uplaod your image");
        // Upload the image file to the storage location
        console.log(this.img_name);
        // const snapshot = await uploadBytes(storageRef, this.file);

        // Get the download URL of the uploaded image
        await uploadBytes(storageRef, this.file).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            this.imgUrl = url;
          });
        });
        alert("Successfully uploaded");
        pop1.close();
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading the image");
      }
    }
  } else {
    this.toast.error("Please first select the file");
  }
}




async sendData() {
  this.userDetails.value.img = this.imgUrl;
  const data = this.userDetails.value;
  
  this.httpservice.sendData(data, 'register').subscribe({
    next: (res) => {
      console.log(res);
        localStorage.setItem("user-info", JSON.stringify(data));
        this.toast.success("Registered successfully");
        this.router.navigate(['/login']);
   
    },
    error: (error) => {
      console.error(error);
      if (error.status === 400) {
        const errorMessage = error.error?.message || "Some serious error occurred";
        this.toast.error(errorMessage);
      } else {
        this.toast.error("Some error occurred");
      }
    }
  });
}


//login function
async navigateToLogin(){
  this.router.navigate(['/login'])
}

}

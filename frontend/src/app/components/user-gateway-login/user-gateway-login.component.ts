import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { HotToastService } from '@ngneat/hot-toast';
@Component({
  selector: 'app-user-gateway-login',
  templateUrl: './user-gateway-login.component.html',
  styleUrls: ['./user-gateway-login.component.css']
})
export class UserGatewayLoginComponent {
constructor(
  private service:HttpService,
  private router:Router,
  private toast:HotToastService
)
{}

userDetails=new FormGroup({
  email:new FormControl(""),
  password:new FormControl("")
})

async logIn(){
  const data=this.userDetails.value;
  console.log(data);
 
  this.service.sendData(data,'login').subscribe({
    next:(res)=>{
    localStorage.setItem("userInfo", JSON.stringify(res));
    this.service.setId(res._id);
    console.log(res);
    this.router.navigate(['/home'])
    },
    error:(err)=>{
      this.toast.error("please login again");
    }
  }
  )
}
}


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserGatewayComponent } from './components/user-gateway/user-gateway.component';
import { UserGatewayLoginComponent } from './components/user-gateway-login/user-gateway-login.component';
import { ChatSecComponent } from './components/chat-sec/chat-sec.component';

const routes: Routes = [
  {
    path:'',
    component:UserGatewayComponent
  },
  {
    path:'login',
    component:UserGatewayLoginComponent
  },
  {
    path:'home',
    component:ChatSecComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

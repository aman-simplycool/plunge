import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserGatewayComponent } from './components/user-gateway/user-gateway.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environement';
import { UserGatewayLoginComponent } from './components/user-gateway-login/user-gateway-login.component';
import { ChatSecComponent } from './components/chat-sec/chat-sec.component';
import { HotToastModule } from '@ngneat/hot-toast';
import { Socket } from 'socket.io-client';
@NgModule({
  declarations: [
    AppComponent,
    UserGatewayComponent,
    UserGatewayLoginComponent,
    ChatSecComponent

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HotToastModule.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private userapiUrl="https://plunge-production.up.railway.app/api/user";
  private chatapiUrl="https://plunge-production.up.railway.app/api/chat"
  private messageUrl="https://plunge-production.up.railway.app/api/message"
  private requestapiUrl="https://plunge-production.up.railway.app/api/request"
  constructor(private http: HttpClient) { }

  
  sendData(data:any,endPoint:string):Observable<any>{
    return this.http.post<any>(`${this.userapiUrl}/${endPoint}`,data);
  }

  sendChatData(data: any, endPoint: string, headers: HttpHeaders): Observable<any> {
    return this.http.post<any>(`${this.chatapiUrl}/${endPoint}`, data, { headers });
  }
  
  getData(endPoint:string,headers:HttpHeaders,userId:string):Observable<any>{
    return this.http.get<any[]>(`${this.chatapiUrl}/${endPoint}/${userId}`,{headers})
    
  }
  userGetData(endPoint:string,headers:any):Observable<any>{
    return this.http.get<any[]>(`${this.userapiUrl}/${endPoint}`,{headers})
  }

  renameGroup(endPoint:string,headers: HttpHeaders,data:any):Observable<any>{
    return this.http.put<any>(`${this.chatapiUrl}/${endPoint}`,data,{headers});
  }

  addMember(endPoint:string,headers: HttpHeaders,data:any):Observable<any>{
    return this.http.put<any>(`${this.chatapiUrl}/${endPoint}`,data,{headers});
  }
  
  getChats(endPoint:string,headers:HttpHeaders,chatId:string):Observable<any>{
    return this.http.get<any[]>(`${this.messageUrl}/${endPoint}/${chatId}`,{headers})
  }

  sendChats(endPoint:string,headers:HttpHeaders,data:any):Observable<any>{
    return this.http.post<any>(`${this.messageUrl}/${endPoint}`,data,{headers});
  }

  createChat(endpoint:string,headers:HttpHeaders,data:any):Observable<any>{
    return this.http.post<any>(`${this.chatapiUrl}/${endpoint}`,data,{headers});
  }

  getUser(endpoint:string,headers:HttpHeaders,userId:string):Observable<any>{
    return this.http.get<any>(`${this.userapiUrl}/${endpoint}/${userId}`,{headers});
  }
  
  checkFriend(endpoint:string,headers:HttpHeaders,userId:string,user1Id:string):Observable<any>{
    return this.http.get<any>(`${this.requestapiUrl}/${endpoint}/${userId}/${user1Id}`,{headers});
  }
  sendReq(endpoint:string,headers:HttpHeaders,data:any):Observable<any>{
    return this.http.post<any>(`${this.requestapiUrl}/${endpoint}`,data,{headers});
  }
  getRequests(endpoint:string,headers:HttpHeaders,userId:string):Observable<any>{
    return this.http.get<any>(`${this.requestapiUrl}/${endpoint}/${userId}`,{headers});
  }
  changeStatus(endpoint:string,headers:HttpHeaders,data:any):Observable<any>{
    return this.http.put<any>(`${this.requestapiUrl}/${endpoint}`,data,{headers});
  }
  
  user_id:string="";

  async setId(id:string){
    this.user_id=id;
  }
  async getId(){
    return this.user_id;
  }

}

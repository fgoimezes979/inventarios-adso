
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root'
  
})
export class CreateService{
 readonly API_URL = "http://localhost:4040/api/parameters/product"
  creates: any[];

  constructor(private http: HttpClient){
    this.creates = [];
  }
  getCreates( ){
    return this.http.get<any[]>(this.API_URL);
  }
}

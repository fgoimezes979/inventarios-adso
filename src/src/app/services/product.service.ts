
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
  
})



export class ProductService {
  getProduct() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:4040/api/parameters/product'; // Asegúrate de que esta sea la URL correcta

  constructor(private http: HttpClient) {}

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:4040/api/parameters/product/${id})`).pipe(
      map(response => {
        if (response) {
          console.log('respuesta del backend:',response);
          return response; // retornamos el producto
        } else {
          throw new Error('Producto no encontrado');
        }
      })
    );
  }

  updateProduct(id: number, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, productData);
  }
}


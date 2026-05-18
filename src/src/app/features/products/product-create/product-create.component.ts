import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class ProductCreateComponent {
  productForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.productForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(5)]],
      name: ['', Validators.required],
      description: [''],
      is_active: [true]
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.http.post('https://inventarios-adso-api.onrender.com/api/parameters/product', this.productForm.value)
        .subscribe({
          next: res => {
            console.log('Producto creado:', res);
            alert('Producto creado con éxito');
          },
          error: err => {
            console.error('Error al crear producto:', err);
            alert('Error al crear producto');
          }
        });
    }
  }
}

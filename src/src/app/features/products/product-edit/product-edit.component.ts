import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule,
   Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';


@Component({

  selector: 'app-product-edit',
  standalone: true,
  templateUrl: './product-edit.component.html',
  styleUrls: [],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})

export class ProductEditComponent implements OnInit {
  
  
  productForm!: FormGroup;
  id: number = 0;
products: any;
  constructor(
    private fb: FormBuilder,
    
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService

  ) {}
ngOnInit(): void {
  
 this.productForm = this.fb.group({
  code: ['', Validators.required],
  name: ['', Validators.required],
  description: [''],
  is_active: [false],
  user_creates_id: [{ value: null, disabled: true }],
  user_updates_id: [null],
  created_at: [{ value: '', disabled: true }],
  updated_at: [{ value: '', disabled: true }],
});


  this. id = Number(this.route.snapshot.paramMap.get('id'));
  console.log('Cargando producto con ID:',this. id);

  this.productService.getProductById(this.id).subscribe({
    next: (response) =>{
      console.log('✅ Producto recibido del backend:', response.product); 
      this.productForm.patchValue(response.product);
    },
    error:(err)=>{console.error('Error al cargar producto:', err);
    }
    });
  



  
  }

  onsubmit(): void {
   
    if (this.productForm.valid) {
      this.productService.updateProduct(this.id, this.productForm.value).subscribe({
        next: () => {
          alert('Producto actualizado con éxito');
          this.router.navigate(['/products']);
        },
        error: (err: any) => {
          console.error('Error al actualizar el producto', err);
        }
      });
    } else {
      alert('Formulario inválido');
   
  }

  }
} 


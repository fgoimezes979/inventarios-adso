import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-show',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './product-show.component.html',
  styles: []
})
export class ProductShowComponent {
  product: any;
}

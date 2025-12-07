import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-produt-show',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './produt-show.component.html',
  styles: ``
})
export class ProdutShowComponent {
product: any;

}

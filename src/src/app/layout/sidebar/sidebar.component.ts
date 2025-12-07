import { Component } from '@angular/core';
import { RouterLink, RouterModule,} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink,RouterModule],
  templateUrl: './sidebar.component.html',
  styles: ``
})
export class SidebarComponent {
product: any;

}



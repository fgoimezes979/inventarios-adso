import { Routes } from "@angular/router";
import { ProdutListComponent } from "./produt-list/produt-list.component";
import { ProductEditComponent } from "./product-edit/product-edit.component";
import { ProdutShowComponent } from "./produt-show/produt-show.component";
import { ProductCreateComponent } from "./product-create/product-create.component";


export const PRODUCTS_ROUTES: Routes=[


    { path: 'list' , component: ProdutListComponent},
    { path: 'create' , component: ProductCreateComponent },
    { path: 'edit/:id' , component: ProductEditComponent },
    { path: 'show/:id' , component: ProdutShowComponent},
    { path: '', redirectTo: '/product/create', pathMatch: 'full' }
 


    
]

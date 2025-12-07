import { Routes } from "@angular/router";
import { SupplierListComponent } from "./supplier-list/supplier-list.component";
import { SupplierEditComponent } from "./supplier-create/supplier-create.component";
import { SuppliersEditComponent } from "./supplier-edit/supplier-edit.component";
import { SupplierShowComponent } from "./supplier-show/supplier-show.component";


export const SUPPLIERS_ROUTES: Routes=[


    { path: 'list' , component: SupplierListComponent },
    { path: 'create' , component: SupplierEditComponent },
    { path: 'edit' , component: SuppliersEditComponent },
    { path: 'show' , component: SupplierShowComponent},
    { path: '', redirectTo: '/supplier/edit', pathMatch: 'full' }
    

    
]
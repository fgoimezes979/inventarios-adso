

import { Routes } from "@angular/router";
import { UserListComponent } from "./user-list/user-list.component";
import { UserCreateComponent } from "./user-create/user-create.component";
import { UserEditComponent } from "./user-edit/user-edit.component";
import { UserShowComponent } from "./user-show/user-show.component";




export const USERS_ROUTES: Routes=[


    { path: 'list' , component: UserListComponent },
    { path: 'create' , component: UserCreateComponent },
    { path: 'edit' , component: UserEditComponent },
    { path: 'show' , component: UserShowComponent},
    { path: '', redirectTo: '/user/list', pathMatch: 'full' }
    

    
]
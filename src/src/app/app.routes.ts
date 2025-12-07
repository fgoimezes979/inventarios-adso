import { Routes } from '@angular/router';

export const routes: Routes = [

    {   path: '',
        redirectTo: 'dashboard' ,
        pathMatch: 'full'

        }


    ,{
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)

    },
    {

        path: 'products',
        loadChildren: () => import('./features/products/product.routes' ).then(c=> c.PRODUCTS_ROUTES)
    },
    
    {

        path: 'products-edit',
        loadComponent: () => import('./features/products/product-edit/product-edit.component' ).then(c => c.ProductEditComponent)
    },
    {

        path: 'products-create',
        loadComponent: () => import('./features/products/product-create/product-create.component' ).then(c => c.ProductCreateComponent)
    },
   
    
    {

        path: 'users',
        loadChildren: () => import('./features/users/user.routes' ).then(c=> c.USERS_ROUTES)
    },
    
  
    

    
        

    {

        path: '**',
        loadComponent: () => import('./layout/page-not-fo/page-not-fo.component').then(c => c.PageNotFoComponent)
    }

    ];



    


    

import { Routes } from "@angular/router";
import { ReportListComponent } from "./report-list/report-list.component";
import { ReportCreateComponent } from "./report-create/report-create.component";
import { ReportEditComponent } from "./report-edit/report-edit.component";
import { ReportShowComponent } from "./report-show/report-show.component";


export const REPORTS_ROUTES: Routes=[


    { path: 'list' , component: ReportListComponent },
    { path: 'create' , component: ReportCreateComponent },
    { path: 'edit' , component: ReportEditComponent },
    { path: 'show' , component: ReportShowComponent},
    { path: '', redirectTo: '/report/edit', pathMatch: 'full' }
    

    
]
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataSetListComponent } from './views/data-set/data-set-list.component';
import { DataSetComponent } from './views/data-set/data-set.component';

const routes: Routes = [
    {
        path: 'datasets/:id',
        component: DataSetComponent,

    },
    {
        path: 'datasets',
        component: DataSetListComponent
    },
    {
        path: '',
        redirectTo: '/datasets',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ClientDetailComponent } from './pages/client-detail/client-detail.component';
import { SearchComponent } from './pages/search/search.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'clients/:id', component: ClientDetailComponent },
  // Add more routes here as you create pages
  // { path: 'demo', component: DemoComponent },
  // { path: 'data-table', component: DataTableComponent },
];
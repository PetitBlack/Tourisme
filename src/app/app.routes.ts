import { Routes } from '@angular/router';
import {HomeComponent } from './home/home.component';
import { LocaliteComponent,} from './localite/localite.component';
import { CarteComponent,} from './carte/carte.component';
import {SitesComponent } from './sites/sites.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'sites', component: SitesComponent },
  { path: 'localites', component: LocaliteComponent },
  { path: 'carte', component: CarteComponent },
];

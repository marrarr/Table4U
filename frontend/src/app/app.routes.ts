import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RestauracjaComponent } from './restauracja/restauracja.component';
import { AuthComponent } from './auth/auth.component';
import { RezerwacjeComponent } from './rezerwacje/rezerwacje.component';


export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'restauracja', component: RestauracjaComponent },
    { path: 'auth', component: AuthComponent },
    { path: 'rezerwacje', component: RezerwacjeComponent }

  ];
import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { CreateUzytkownikDto } from '../models/uzytkownik.model';
import { Uzytkownik } from '../models/uzytkownik.model';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [  ButtonModule, HttpClientModule, CommonModule, DialogModule, FormsModule, ToastModule],
  providers: [AuthService, MessageService],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
constructor(
    private authService: AuthService,
    private messageService: MessageService
) {}
    addingDialog: boolean = false;
    loginDialog: boolean = false;
    isLoggedin: boolean = false;
    user: Uzytkownik = {

    }
    newUser: CreateUzytkownikDto = {
        imie: '',
        nazwisko: '',
        email: '',
        telefon: '',
        login: '',
        haslo: '',
        rola_id: 1,
        confirmed: false
    };

login() {
  if (!this.user.login || !this.user.haslo) {
    this.messageService.add({ 
        severity: 'error', 
        summary: 'Błąd', 
        detail: 'Login i hasło są wymagane!' 
      });
    return;
  }

  this.authService.login(this.user.login, this.user.haslo)
    .subscribe(res => {
      this.authService.setToken(res.access_token);
    });
}

register() {
     if (!this.newUser.login || !this.newUser.haslo || !this.newUser.imie || !this.newUser.nazwisko || !this.newUser.email || !this.newUser.telefon) {
    this.newUser.rola_id = 1;
    this.newUser.confirmed = false;
    this.messageService.add({ 
        severity: 'error', 
        summary: 'Błąd', 
        detail: 'Wszystkie dane są wymagane!' 
      });
    return;
  }
  this.authService.register(this.newUser).subscribe(res => {
    this.addingDialog = false
  });
}

checklogged()
{
  const token = this.authService.getToken();
  if (token) {
    const decoded: any = jwtDecode(token);
    this.isLoggedin = true;
    console.log('Logged in as:', decoded.username);
  } else {
    this.isLoggedin = false;
  }
}

  protected readonly title = signal('Witaj na stronie onas!');
}

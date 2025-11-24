import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import 'primeicons/primeicons.css';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    ButtonModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  constructor(private router: Router) {}

  public buttons = [
    { label: 'Strona Główna', link: '/', icon: 'pi pi-home' },
    { label: 'Kontakt', link: '/contact', icon: 'pi pi-envelope' },
    { label: 'O nas', link: '/about', icon: 'pi pi-info-circle' },
    { label: 'Restauracje', link: '/restaurant', icon: 'pi pi-cloud' },
  ];
  
  openLink(url: string) {
    this.router.navigateByUrl(url);
  }
}

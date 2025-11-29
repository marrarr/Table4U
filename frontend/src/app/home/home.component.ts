import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';
import { RestauracjaService } from './restauracja.service'; 
import { Restauracja } from '../models/restauracja.model'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    ProgressSpinnerModule, 
    ToastModule,
    HttpClientModule
  ],
  providers: [MessageService, RestauracjaService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  restauracje: Restauracja[] = [];
  loading: boolean = false;

  constructor(
    private restauracjaService: RestauracjaService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRestauracje();
  }

  loadRestauracje(): void {
    this.loading = true;
    this.restauracjaService.getRestauracje().subscribe({
      next: (restauracje: Restauracja[]) => {
        this.restauracje = restauracje;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Błąd podczas ładowania restauracji:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się załadować listy restauracji'
        });
        this.loading = false;
      }
    });
  }

  showDetails(restauracja: Restauracja): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Szczegóły restauracji',
      detail: `Wyświetlanie szczegółów: ${restauracja.nazwa}`
    });
  }

  makeReservation(restauracja: Restauracja): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Rezerwacja',
      detail: `Rozpoczynanie rezerwacji w: ${restauracja.nazwa}`
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { RestauracjaService } from '../restauracja/restauracja.service';
import { Restauracja } from '../models/restauracja.model';
import { ReservationDialogComponent, Table } from '../reservation/reservation-dialog.component';

interface CreateRezerwacjaDto {
  restauracja_id: number;
  data: string;          // YYYY-MM-DD
  godzina: string;       // HH:MM
  stoliki: number[];
  liczba_osob: number;
  imie: string;
  telefon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    HttpClientModule,
    ReservationDialogComponent
  ],
  providers: [MessageService, RestauracjaService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  restauracje: Restauracja[] = [];
  loading = false;
  reservationDialogVisible = false;
  selectedRestaurant: Restauracja | null = null;

  private occupiedTables = new Map<number, Set<number>>();

  constructor(
    private restauracjaService: RestauracjaService,
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadRestauracje();
  }

  loadRestauracje(): void {
    this.loading = true;
    this.restauracjaService.getAllRestaurants()
      .then(data => {
        this.restauracje = data;
        this.loading = false;
      })
      .catch(err => {
        console.error('Błąd ładowania restauracji:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się załadować listy restauracji'
        });
        this.loading = false;
      });
  }

  openReservationDialog(restauracja: Restauracja) {
    this.selectedRestaurant = restauracja;

    const occupiedInThisRestaurant =
      this.occupiedTables.get(restauracja.restauracja_id!) || new Set<number>();

    (ReservationDialogComponent as any).permanentlyOccupied =
      Array.from(occupiedInThisRestaurant);

    this.reservationDialogVisible = true;
  }

  onReservationConfirmed(event: { 
    tables: { id: number; seats: number }[]; 
    form: { 
      imie: string; 
      telefon: string; 
      data: Date; 
      godzina: Date;
    } 
  }) {
    const selectedTables = event.tables;
    const form = event.form;

    if (!this.selectedRestaurant || selectedTables.length === 0) {
      this.reservationDialogVisible = false;
      return;
    }

    const restauracjaId = this.selectedRestaurant.restauracja_id!;
    const tableIds = selectedTables.map(t => t.id);
    const totalSeats = selectedTables.reduce((s, t) => s + t.seats, 0);

    // Formatowanie daty i godziny do formatu oczekiwanego przez backend
    const dataStr = form.data.toISOString().slice(0, 10); // YYYY-MM-DD
    const godzinaStr = form.godzina.toTimeString().slice(0, 5); // HH:MM

    const payload: CreateRezerwacjaDto = {
      restauracja_id: restauracjaId,
      data: dataStr,
      godzina: godzinaStr,
      stoliki: tableIds,
      liczba_osob: totalSeats,
      imie: form.imie.trim(),
      telefon: form.telefon.trim()
    };

    this.http.post('http://localhost:3000/rezerwacja', payload).subscribe({
      next: () => {
        // Sukces – blokujemy stoliki lokalnie
        const set = this.occupiedTables.get(restauracjaId) || new Set<number>();
        tableIds.forEach(id => set.add(id));
        this.occupiedTables.set(restauracjaId, set);

        this.messageService.add({
          severity: 'success',
          summary: 'Rezerwacja przyjęta!',
          detail: `Zarezerwowano ${selectedTables.length} stolik(ów) na ${dataStr} ${godzinaStr} dla ${form.imie}`
        });

        this.reservationDialogVisible = false;
      },
      error: (error: any) => {
        console.error('Błąd rezerwacji:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd rezerwacji',
          detail: error.error?.message || 'Nie udało się zapisać rezerwacji. Spróbuj ponownie.'
        });
      }
    });
  }

  onDialogHide() {
    this.reservationDialogVisible = false;
    this.selectedRestaurant = null;
  }

  getMainImage(restauracja: Restauracja) {
    if (!restauracja.obrazy) return null;
    return restauracja.obrazy.find(o => o.czy_glowne) || null;
  }
}
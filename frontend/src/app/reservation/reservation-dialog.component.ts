// src/app/reservation/reservation-dialog.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';

export interface Table {
  id: number;
  seats: number;
  top: number;
  left: number;
  reserved: boolean; // Czy stolik jest zajęty przez kogoś innego (dane z backendu)
  permanentlyReserved?: boolean; // Flaga pomocnicza do blokowania interakcji
}

@Component({
  selector: 'app-reservation-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    DialogModule, 
    ButtonModule, 
    FormsModule, 
    DatePickerModule,
    InputTextModule 
  ],
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.scss']
})
export class ReservationDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() restaurantName: string = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<{
    tables: { id: number; seats: number }[];
    form: {
      imie: string;
      telefon: string;
      data: Date;
      godzina: Date;
    }
  }>();

  // Symulacja zajętych stolików (np. z backendu)
  private static permanentlyOccupied: number[] = [];

  tables: Table[] = [
    { id: 1, seats: 4, top: 160, left: 160, reserved: false },
    { id: 2, seats: 6, top: 160, left: 410, reserved: false },
    { id: 3, seats: 2, top: 160, left: 660, reserved: false },
    { id: 4, seats: 4, top: 360, left: 210, reserved: false },
    { id: 5, seats: 8, top: 360, left: 460, reserved: false },
    { id: 6, seats: 4, top: 530, left: 140, reserved: false },
    { id: 7, seats: 4, top: 530, left: 360, reserved: false },
    { id: 8, seats: 6, top: 530, left: 610, reserved: false },
  ];

  selectedTables: Table[] = [];
  
  formData = {
    imie: '',
    telefon: '',
    data: new Date(),
    godzina: new Date()
  };

  ngOnInit(): void {
    const occupied = ReservationDialogComponent.permanentlyOccupied || [];
    this.tables.forEach(table => {
      // Jeśli stolik jest zajęty "z góry", oznaczamy go jako trwale zajęty
      if (occupied.includes(table.id)) {
        table.reserved = true;
        table.permanentlyReserved = true;
      } else {
        table.reserved = false;
        table.permanentlyReserved = false;
      }
    });
    // Czyścimy statyczną tablicę po inicjalizacji (opcjonalne, zależnie od logiki aplikacji)
    ReservationDialogComponent.permanentlyOccupied = [];
  }

  // --- LOGIKA WYBORU STOLIKA (Bez wyskakującego okna) ---

  /**
   * Sprawdza, czy stolik znajduje się na liście wybranych przez użytkownika.
   * Używane do nadawania klasy .table-selected w HTML.
   */
  isTableSelected(table: Table): boolean {
    return this.selectedTables.some(t => t.id === table.id);
  }

  /**
   * Główna metoda obsługi kliknięcia w stolik.
   * Dodaje lub usuwa stolik z listy wyboru.
   */
  toggleTableSelection(table: Table) {
    // 1. Jeśli stolik jest trwale zajęty (szary), nie pozwól na wybór
    if (table.permanentlyReserved) {
      return;
    }

    const index = this.selectedTables.findIndex(t => t.id === table.id);

    if (index > -1) {
      // Jeśli już jest wybrany -> usuń (odznacz)
      this.selectedTables.splice(index, 1);
    } else {
      // Jeśli nie jest wybrany -> dodaj do listy
      this.selectedTables.push(table);
    }
  }

  /**
   * Usuwa stolik z listy wybranych (np. przez przycisk 'X' w formularzu).
   */
  removeTable(table: Table) {
    this.selectedTables = this.selectedTables.filter(t => t.id !== table.id);
  }

  // --- LOGIKA FORMULARZA I ZAMYKANIA ---

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.resetForm();
  }

  private resetForm() {
    this.selectedTables = [];
    // Opcjonalnie reset danych formularza, jeśli chcesz:
    // this.formData = { imie: '', telefon: '', data: new Date(), godzina: new Date() };
  }

  confirmReservationWithForm() {
    if (!this.isFormValid()) {
      return;
    }

    const confirmedTables = this.selectedTables.map(t => ({
      id: t.id,
      seats: t.seats
    }));

    // Emitujemy wybrane stoliki + dane z formularza
    this.confirm.emit({
      tables: confirmedTables,
      form: this.formData
    });

    this.close();
  }

  isFormValid(): boolean {
    return !!(
      this.formData.imie.trim() &&
      this.formData.telefon.trim() &&
      this.formData.data &&
      this.formData.godzina &&
      this.selectedTables.length > 0
    );
  }

  getTotalSeats(): number {
    return this.selectedTables.reduce((sum, t) => sum + t.seats, 0);
  }

  // --- LOGIKA WIZUALNA (Krzesła) ---

  getChairTransform(seats: number, index: number): string {
    const angle = (index * 360) / seats;
    const radius = seats <= 4 ? 68 : 76;
    return `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`;
  }
}
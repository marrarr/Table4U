// src/app/reservation/reservation-dialog.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

export interface Table {
  id: number;
  seats: number;
  top: number;
  left: number;
  reserved: boolean;
}

@Component({
  selector: 'app-reservation-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.scss']
})
export class ReservationDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() restaurantName: string = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<Table[]>();

  // Lista stolików już trwale zajętych (z backendu lub poprzednich rezerwacji)
  static permanentlyOccupied: number[] = [];

  // src/app/reservation/reservation-dialog.component.ts

tables: Table[] = [
  { id: 1, seats: 4, top: 160, left: 160, reserved: false },   // +60px w prawo
  { id: 2, seats: 6, top: 160, left: 410, reserved: false },   // 350 + 60
  { id: 3, seats: 2, top: 160, left: 660, reserved: false },   // 600 + 60
  { id: 4, seats: 4, top: 360, left: 210, reserved: false },   // 150 + 60
  { id: 5, seats: 8, top: 360, left: 460, reserved: false },   // 400 + 60
  { id: 6, seats: 4, top: 530, left: 140, reserved: false },   // 80 + 60
  { id: 7, seats: 4, top: 530, left: 360, reserved: false },   // 300 + 60
  { id: 8, seats: 6, top: 530, left: 610, reserved: false },   // 550 + 60
];

  selectedTables: Table[] = [];
  showTableDialog = false;
  currentTable: Table | null = null;

  ngOnInit(): void {
    // Zablokuj TYLKO trwale zajęte stoliki (z poprzednich ZATWIERDZONYCH rezerwacji)
    const occupied = (ReservationDialogComponent as any).permanentlyOccupied || [];
    this.tables.forEach(table => {
      table.reserved = occupied.includes(table.id);
    });

    // Wyczyść statyczną listę – nie chcemy jej zostawiać na następną restaurację
    (ReservationDialogComponent as any).permanentlyOccupied = [];
  }

  openTableDialog(table: Table) {
    if (table.reserved) return;
    this.currentTable = table;
    this.showTableDialog = true;
  }

  addTable() {
    if (this.currentTable && !this.currentTable.reserved) {
      this.currentTable.reserved = true;
      this.selectedTables.push({ ...this.currentTable });
    }
    this.showTableDialog = false;
    this.currentTable = null;
  }

  removeTable(table: Table) {
    this.selectedTables = this.selectedTables.filter(t => t.id !== table.id);
    const original = this.tables.find(t => t.id === table.id);
    if (original && !this.isPermanentlyOccupied(table.id)) {
      original.reserved = false; // odblokuj tylko jeśli nie był trwale zajęty
    }
  }

  private isPermanentlyOccupied(tableId: number): boolean {
    const occupied = (ReservationDialogComponent as any).permanentlyOccupied || [];
    return occupied.includes(tableId);
  }

  confirmReservation() {
    this.confirm.emit(this.selectedTables);
    this.close(); // zamknie dialog, ale stoliki tymczasowo zaznaczone znikną
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);

    // PRZY ANULOWANIU – odblokuj wszystkie tymczasowo wybrane stoliki
    this.tables.forEach(table => {
      const isSelected = this.selectedTables.some(t => t.id === table.id);
      const isPermanently = this.isPermanentlyOccupied(table.id);
      if (isSelected && !isPermanently) {
        table.reserved = false;
      }
    });

    this.selectedTables = [];
  }

  getTotalSeats(): number {
    return this.selectedTables.reduce((sum, t) => sum + t.seats, 0);
  }

  // Do rotacji krzesełek
  getChairTransform(seats: number, index: number): string {
  const angle = (index * 360) / seats;
  const radius = seats <= 4 ? 68 : 76; // idealnie dopasowane
  return `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`;
}
}
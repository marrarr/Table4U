import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';

// Angular CDK
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';

export interface Table {
  id: number;
  seats: number;
  top: number;
  left: number;
  reserved: boolean;
  permanentlyReserved?: boolean;
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
    InputTextModule,
    DragDropModule 
  ],
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.scss']
})
export class ReservationDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() restaurantName: string = '';
  @Input() isEditable: boolean = false; // Tryb edycji dla właściciela

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() layoutSaved = new EventEmitter<Table[]>();
  @Output() confirm = new EventEmitter<{
    tables: { id: number; seats: number }[];
    form: {
      imie: string;
      telefon: string;
      data: Date;
      godzina: Date;
    }
  }>();

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
      if (occupied.includes(table.id)) {
        table.reserved = true;
        table.permanentlyReserved = true;
      } else {
        table.reserved = false;
        table.permanentlyReserved = false;
      }
    });
    ReservationDialogComponent.permanentlyOccupied = [];
  }

  // --- LOGIKA DRAG & DROP (POPRAWIONA) ---

  onDragEnded(event: CdkDragEnd, table: Table) {
    if (!this.isEditable) return;

    // Pobieramy element DOM stolika i jego rodzica (salę)
    const element = event.source.element.nativeElement;
    const parent = element.parentElement;

    if (!parent) return;

    // 1. Pobieramy dokładną pozycję stolika na ekranie (gdzie go upuściłeś)
    const elementRect = element.getBoundingClientRect();
    
    // 2. Pobieramy pozycję rodzica na ekranie
    const parentRect = parent.getBoundingClientRect();

    // 3. Obliczamy grubość ramki (border) rodzica, 
    //    ponieważ pozycjonowanie 'absolute' jest względem wnętrza (padding-box),
    //    a getBoundingClientRect uwzględnia ramki.
    const borderLeft = parent.clientLeft || 0;
    const borderTop = parent.clientTop || 0;

    // 4. Obliczamy nową pozycję:
    //    Pozycja Elementu - Pozycja Rodzica - Ramka Rodzica + Scroll Rodzica
    const newLeft = elementRect.left - parentRect.left - borderLeft + parent.scrollLeft;
    const newTop = elementRect.top - parentRect.top - borderTop + parent.scrollTop;

    // 5. Aktualizujemy model
    table.left = newLeft;
    table.top = newTop;

    // 6. Resetujemy transformację CDK. 
    //    Stolik zostanie w miejscu, które właśnie obliczyliśmy i przypisaliśmy do [style.top/left].
    event.source.reset();
  }

  saveLayout() {
    this.layoutSaved.emit(this.tables);
    this.close();
  }

  // --- LOGIKA WYBORU STOLIKA (KLIENT) ---

  isTableSelected(table: Table): boolean {
    return this.selectedTables.some(t => t.id === table.id);
  }

  toggleTableSelection(table: Table) {
    if (this.isEditable || table.permanentlyReserved) {
      return;
    }

    const index = this.selectedTables.findIndex(t => t.id === table.id);

    if (index > -1) {
      this.selectedTables.splice(index, 1);
    } else {
      this.selectedTables.push(table);
    }
  }

  removeTable(table: Table) {
    this.selectedTables = this.selectedTables.filter(t => t.id !== table.id);
  }

  // --- LOGIKA FORMULARZA ---

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.resetForm();
  }

  private resetForm() {
    this.selectedTables = [];
    this.formData = { imie: '', telefon: '', data: new Date(), godzina: new Date() };
  }

  confirmReservationWithForm() {
    if (!this.isFormValid()) {
      return;
    }

    const confirmedTables = this.selectedTables.map(t => ({
      id: t.id,
      seats: t.seats
    }));

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

  getChairTransform(seats: number, index: number): string {
    const angle = (index * 360) / seats;
    const radius = seats <= 4 ? 68 : 76;
    return `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`;
  }
}
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber'; // Potrzebne do edycji liczby miejsc

// Angular CDK
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';

// Services & Models
import { ReservationService } from './reservation.service';
import { Stolik } from '../models/stolik.model'; // Upewnij się, że ten plik istnieje (jak w poprzedniej odpowiedzi)

// Interfejs UI - rozszerza lub mapuje dane z bazy na potrzeby widoku (np. top/left zamiast pozycjaY/X)
export interface TableUI {
  id: number;            // Odpowiednik stolik_id
  seats: number;         // Odpowiednik ilosc_miejsc
  top: number;           // Odpowiednik pozycjaY_UI
  left: number;          // Odpowiednik pozycjaX_UI
  lokalizacja: string;   // Nowe pole do edycji
  reserved: boolean;     // Status wyliczony na podstawie rezerwacji
  permanentlyReserved?: boolean; // Status zajętości z bazy
  originalData?: Stolik; // Referencja do pełnego obiektu z bazy (opcjonalnie)
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
    InputNumberModule,
    DragDropModule 
  ],
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.scss'],
  providers: [ReservationService],
})
export class ReservationDialogComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() restaurantName: string = '';
  @Input() isEditable: boolean = false; // Tryb edycji dla właściciela
  @Input() reservedTableIds: number[] = [];
  @Input() restauracjaId: number = 0;

  @Output() visibleChange = new EventEmitter<boolean>();
  // Emitujemy teraz TableUI[], bo to na nich operuje widok (zmiany lokalne przed zapisem)
  @Output() layoutSaved = new EventEmitter<TableUI[]>(); 
  @Output() confirm = new EventEmitter<{
    tables: { id: number; seats: number }[];
    form: {
      imie: string;
      telefon: string;
      data: Date;
      godzina: Date;
    }
  }>();

  // Główna lista stolików w widoku
  tables: TableUI[] = [];

  // Zmienne stanu
  selectedTables: TableUI[] = [];      // Stoliki wybrane przez klienta do rezerwacji
  editingTable: TableUI | null = null; // Stolik aktualnie edytowany przez właściciela
  
  formData = {
    imie: '',
    telefon: '',
    data: new Date(),
    godzina: new Date()
  };

  loadingReserved = false;

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    if (this.restauracjaId) {
      this.loadTablesFromDb();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 1. Zmiana restauracji -> pobierz nowy układ
    if (changes['restauracjaId'] && this.restauracjaId) {
      this.loadTablesFromDb();
    }
    // 2. Otwarcie okna -> odśwież rezerwacje (zajętość)
    if (changes['visible'] && this.visible && this.restauracjaId) {
      this.fetchAndBlockReservedTables(); 
    }
    // 3. Zmiana trybu edycji -> wyczyść zaznaczenia
    if (changes['isEditable']) {
      this.editingTable = null;
      this.selectedTables = [];
    }
  }

  // --- 1. POBIERANIE DANYCH Z BAZY ---

  async loadTablesFromDb() {
    try {
      const stolikiDb = await this.reservationService.getStolikiByRestauracja(this.restauracjaId);
      
      // Mapowanie modelu z backendu (Stolik) na model widoku (TableUI)
      this.tables = stolikiDb.map(s => ({
        id: s.stolik_id,
        seats: s.ilosc_miejsc,
        lokalizacja: s.lokalizacja,
        // Domyślne 50,50 jeśli w bazie jest null/0, żeby stolik nie "zniknął" poza ekranem
        left: s.pozycjaX_UI || 50, 
        top: s.pozycjaY_UI || 50,
        reserved: false,
        permanentlyReserved: false,
        originalData: s
      }));

      // Po załadowaniu struktury, sprawdźmy dostępność na wybraną datę
      this.fetchAndBlockReservedTables();

    } catch (error) {
      console.error('Błąd podczas pobierania stolików:', error);
    }
  }

  async fetchAndBlockReservedTables() {
    if (!this.restauracjaId || !this.formData.data || !this.formData.godzina || this.tables.length === 0) {
      return;
    }
    this.loadingReserved = true;
    const dataStr = this.formatDate(this.formData.data);
    const godzinaStr = this.formatTime(this.formData.godzina);
    
    try {
      const reservations = await this.reservationService.getOccupied(
        this.restauracjaId,
        dataStr,
        godzinaStr
      );
      
      // Backend zwraca listę rezerwacji, każda ma tablicę 'stoliki' (IDs)
      const reservedIds = reservations.flatMap(r => r.stoliki); 

      this.tables.forEach(table => {
        if (reservedIds.includes(table.id)) {
          table.reserved = true;
          table.permanentlyReserved = true;
          // Jeśli klient miał go zaznaczonego, a okazuje się zajęty -> odznacz
          this.selectedTables = this.selectedTables.filter(t => t.id !== table.id);
        } else {
          table.reserved = false;
          table.permanentlyReserved = false;
        }
      });
    } catch (err) {
      console.error('[DEBUG] Błąd pobierania rezerwacji:', err);
    }
    this.loadingReserved = false;
  }

  // --- 2. EDYTOR UKŁADU (WŁAŚCICIEL) ---

  // Dodawanie nowego stolika do widoku
  addNewTable() {
    // Generujemy tymczasowe ID dla widoku (największe + 1). Backend nada prawdziwe ID po zapisie.
    const newId = this.tables.length > 0 ? Math.max(...this.tables.map(t => t.id)) + 1 : 1;
    
    const newTable: TableUI = {
      id: newId,
      seats: 4, // Domyślnie 4 miejsca
      top: 100, // Domyślna pozycja startowa
      left: 100,
      lokalizacja: 'Sala',
      reserved: false,
      permanentlyReserved: false
    };

    this.tables.push(newTable);
    this.editingTable = newTable; // Od razu zaznaczamy do edycji
  }

  // Usuwanie aktualnie edytowanego stolika
  deleteTable() {
    if (!this.editingTable) return;
    
    this.tables = this.tables.filter(t => t !== this.editingTable);
    this.editingTable = null; // Czyścimy wybór
  }

  // Obsługa kliknięcia w stolik (zależnie od trybu)
  onTableClick(table: TableUI) {
    if (this.isEditable) {
      // Tryb edycji: wybieramy stolik do edycji parametrów
      this.editingTable = table;
    } else {
      // Tryb klienta: zaznaczamy stolik do rezerwacji
      this.toggleTableSelection(table);
    }
  }

  // Kliknięcie w tło sali (odznaczenie edycji)
  onBackgroundClick(event: MouseEvent) {
    // Sprawdzamy czy kliknięto bezpośrednio w tło (.restaurant-hall), a nie w dziecko (stolik)
    if ((event.target as HTMLElement).classList.contains('restaurant-hall')) {
      if (this.isEditable) {
        this.editingTable = null;
      }
    }
  }

  // Drag & Drop (przesuwanie stolików)
  onDragEnded(event: CdkDragEnd, table: TableUI) {
    if (!this.isEditable) return;

    const element = event.source.element.nativeElement;
    const parent = element.parentElement;

    if (!parent) return;

    // Obliczamy nową pozycję względem rodzica (sali)
    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    const borderLeft = parent.clientLeft || 0;
    const borderTop = parent.clientTop || 0;

    const newLeft = elementRect.left - parentRect.left - borderLeft + parent.scrollLeft;
    const newTop = elementRect.top - parentRect.top - borderTop + parent.scrollTop;

    // Aktualizacja modelu lokalnego
    table.left = newLeft;
    table.top = newTop;
    
    // Po przesunięciu ustawiamy go też jako edytowany, żeby łatwo zmienić np. liczbę miejsc
    this.editingTable = table;

    // Reset transformacji CSS (bo pozycja jest już ustawiona przez [style.top/left])
    event.source.reset();
  }

  saveLayout() {
    // Emitujemy aktualny stan tabel do rodzica (który wyśle to do API)
    this.layoutSaved.emit(this.tables);
    this.close();
  }

  // --- 3. REZERWACJA (KLIENT) ---

  isTableSelected(table: TableUI): boolean {
    if (this.isEditable) {
      return this.editingTable === table; // W trybie edycji zaznaczony jest ten edytowany
    }
    return this.selectedTables.some(t => t.id === table.id);
  }

  toggleTableSelection(table: TableUI) {
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

  removeTableFromSelection(table: TableUI) {
    this.selectedTables = this.selectedTables.filter(t => t.id !== table.id);
  }

  confirmReservationWithForm() {
    if (!this.isFormValid()) return;

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

  // --- 4. UTILS & FORMULARZ ---

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.resetForm();
  }

  private resetForm() {
    this.selectedTables = [];
    this.editingTable = null;
    this.formData = { imie: '', telefon: '', data: new Date(), godzina: new Date() };
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

  // Rysowanie krzeseł wokół stolika
  getChairTransform(seats: number, index: number): string {
    const angle = (index * 360) / seats;
    const radius = seats <= 4 ? 68 : 76; // Większy promień dla większych stolików
    return `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`;
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  onDateChange() {
    this.fetchAndBlockReservedTables();
  }
  onHourChange() {
    this.fetchAndBlockReservedTables();
  }
}
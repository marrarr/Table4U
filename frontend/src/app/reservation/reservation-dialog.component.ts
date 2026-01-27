import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';

// Angular CDK
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { ReservationService } from './reservation.service';
import { RestauracjaService } from '../restauracja/restauracja.service';
import { PrimeNG } from 'primeng/config';

export interface Table {
  id: number;
  seats: number;
  top: number;
  left: number;
  reserved: boolean;
  permanentlyReserved?: boolean;
  lokalizacja?: string;
  serverId?: number; // corresponds to DB stolik_id when present
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
  styleUrls: ['./reservation-dialog.component.scss'],
  providers: [ReservationService],
})
export class ReservationDialogComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() restaurantName: string = '';
  @Input() isEditable: boolean = false; // Tryb edycji dla właściciela
  @Input() reservedTableIds: number[] = [];
  @Input() restauracjaId?: number;

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

  // Stolików zaczynamy od pustej listy — załadujemy je z serwera
  tables: Table[] = [];
  // Table currently selected in edit mode (for editing properties)
  selectedForEdit: Table | null = null;

  selectedTables: Table[] = [];
  
  formData = {
    imie: '',
    telefon: '',
    data: new Date(),
    godzina: new Date()
  };

  loadingReserved = false;

  // Polish locale for PrimeNG datepicker
  plLocale: any;

  constructor(
    private reservationService: ReservationService,
    private restauracjaService: RestauracjaService,
    private primengConfig: PrimeNG
  ) {}

  ngOnInit(): void {
    this.plLocale = {
      firstDayOfWeek: 1,
      dayNames: ['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'],
      dayNamesShort: ['Nd','Pn','Wt','Śr','Cz','Pt','So'],
      dayNamesMin: ['Nd','Pn','Wt','Śr','Cz','Pt','So'],
      monthNames: ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'],
      monthNamesShort: ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'],
      today: 'Dziś',
      clear: 'Wyczyść',
      dateFormat: 'yy-mm-dd'
    };

    // Apply PrimeNG translations globally for datepicker
    try {
      this.primengConfig?.setTranslation?.(this.plLocale);
    } catch (e) {
      // ignore if primengConfig not injected
    }

    this.loadTables();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['restauracjaId'] && changes['restauracjaId'].currentValue) {
      this.loadTables();
    }
  }

  async loadTables() {
    if (!this.restauracjaId) return;
    try {
      const stoliki = await this.restauracjaService.getTables(this.restauracjaId);
      this.tables = stoliki.map(s => ({
        id: (s as any).numer_stolika ?? (s as any).stolik_id ?? s.id,
        seats: (s as any).ilosc_miejsc ?? (s as any).seats ?? 4,
        top: (s as any).pozycjaY_UI ?? (s as any).top ?? 0,
        left: (s as any).pozycjaX_UI ?? (s as any).left ?? 0,
        reserved: false,
        permanentlyReserved: false,
        lokalizacja: (s as any).lokalizacja ?? '',
        serverId: (s as any).stolik_id ?? undefined,
      }));
    } catch (err) {
      console.error('[DEBUG] Błąd pobierania stolików:', err);
      this.tables = [];
    }

    // Po załadowaniu stolików sprawdź rezerwacje na wskazaną datę/godzinę
    this.fetchAndBlockReservedTables();
  }

  async fetchAndBlockReservedTables() {
    if (!this.restauracjaId || !this.formData.data || !this.formData.godzina) {
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
      const reservedIds = reservations.flatMap(r => r.stoliki);
      this.tables.forEach(table => {
        if (reservedIds.includes(table.id)) {
          table.reserved = true;
          table.permanentlyReserved = true;
          // Remove from selected if just became reserved
          this.selectedTables = this.selectedTables.filter(t => t.id !== table.id);
        } else {
          table.reserved = false;
          table.permanentlyReserved = false;
        }
      });
    } catch (err) {
      console.error('[DEBUG] Błąd pobierania rezerwacji:', err);
      this.tables.forEach(table => {
        table.reserved = false;
        table.permanentlyReserved = false;
      });
    }
    this.loadingReserved = false;
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
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

  // --- EDIT MODE: selecting / adding / deleting tables ---

  selectTableForEdit(table: Table) {
    if (!this.isEditable) return;
    this.selectedForEdit = table;
  }

  addTable() {
    if (!this.isEditable) return;
    const maxId = this.tables.reduce((m, t) => Math.max(m, t.id), 0);
    const newTable: Table = {
      id: maxId + 1,
      seats: 4,
      top: 200,
      left: 200,
      reserved: false,
      permanentlyReserved: false,
      lokalizacja: ''
    };
    this.tables.push(newTable);
    // focus the new table for editing
    this.selectedForEdit = newTable;
  }

  deleteSelectedTable() {
    if (!this.isEditable || !this.selectedForEdit) return;
    const id = this.selectedForEdit.id;
    this.tables = this.tables.filter(t => t.id !== id);
    // remove from any selectedTables used for reservation as well
    this.selectedTables = this.selectedTables.filter(t => t.id !== id);
    this.selectedForEdit = null;
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

  // Add listeners for date/hour change
  onDateChange() {
    this.fetchAndBlockReservedTables();
  }
  onHourChange() {
    this.fetchAndBlockReservedTables();
  }
}
// src/app/restauracja/layout/rezerwacja-stolikow.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { Stolik, ElementDekoracyjny, Rezerwacja } from '../../models/stolik.model';
import { StolikService } from './stolik.service';

@Component({
  selector: 'app-rezerwacja-stolikow',
  standalone: true,
  imports: [
    CommonModule, 
    DialogModule, 
    ButtonModule, 
    InputTextModule, 
    InputNumberModule,
    FormsModule
  ],
  templateUrl: './rezerwacja-stolikow.component.html',
  styleUrls: ['./rezerwacja-stolikow.component.scss']
})
export class RezerwacjaStolikowComponent implements OnInit, OnDestroy {
  @Input() restauracjaId!: number;
  @Input() trybWlasciciela = false;

  stoliki: Stolik[] = [];
  elementy: ElementDekoracyjny[] = [];
  pokazDialogStolik = false;
  pokazDialogRezerwacja = false;
  wybranyStolik: Stolik | null = null;
  wybraneStoliki: Stolik[] = [];
  
  // Dane rezerwacji
  daneRezerwacji = {
    data: this.formatDate(new Date()),
    godzinaOd: '18:00',
    godzinaDo: '20:00',
    imie: '',
    nazwisko: '',
    email: '',
    telefon: '',
    iloscOsob: 1,
    uwagi: ''
  };
  
  // Filtry daty
  dzisiaj = new Date();
  minimalnaData: string;
  maksymalnaData: string;

  constructor(private stolikService: StolikService) {
    // Ustaw minimalną datę (dzisiaj)
    this.minimalnaData = this.formatDate(this.dzisiaj);
    
    // Ustaw maksymalną datę (za 3 miesiące)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    this.maksymalnaData = this.formatDate(maxDate);
  }

  // Formatuj datę do formatu YYYY-MM-DD dla input type="date"
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.loadStoliki();
    this.loadElementy();
  }

  ngOnDestroy(): void {
    this.wyczyscRezerwacje();
  }

  private async loadStoliki() {
    try {
      this.stoliki = await this.stolikService.getStoliki(this.restauracjaId);
      
      // Jeśli jest tryb właściciela, załaduj rezerwacje na dziś
      if (this.trybWlasciciela) {
        await this.oznaczZarezerwowane();
      }
    } catch (error) {
      console.error('Błąd podczas ładowania stolików:', error);
    }
  }

  private async loadElementy() {
    try {
      this.elementy = await this.stolikService.getElementy(this.restauracjaId);
    } catch (error) {
      console.error('Błąd podczas ładowania elementów:', error);
    }
  }

  private async oznaczZarezerwowane() {
    try {
      const rezerwacje = await this.stolikService.getRezerwacje(this.restauracjaId, new Date());
      
      // Zbierz wszystkie zarezerwowane stoliki
      const zarezerwowaneIds = new Set<number>();
      rezerwacje.forEach(r => {
        r.stoliki_ids.forEach(id => zarezerwowaneIds.add(id));
      });
      
      // Oznacz stoliki jako zarezerwowane
      this.stoliki.forEach(stolik => {
        if (stolik.stolik_id && zarezerwowaneIds.has(stolik.stolik_id)) {
          stolik.zarezerwowany = true;
        }
      });
    } catch (error) {
      console.error('Błąd podczas oznaczania zarezerwowanych stolików:', error);
    }
  }

  wybierz(stolik: Stolik): void {
    if (stolik.zarezerwowany && !this.trybWlasciciela) {
      return;
    }

    this.wybranyStolik = stolik;
    this.pokazDialogStolik = true;
  }

  dodajDoRezerwacji(): void {
    if (this.wybranyStolik && !this.wybraneStoliki.includes(this.wybranyStolik)) {
      this.wybraneStoliki.push(this.wybranyStolik);
      this.daneRezerwacji.iloscOsob = this.sumaMiejsc;
    }
    this.pokazDialogStolik = false;
    this.wybranyStolik = null;
  }

  otworzFormularzRezerwacji(): void {
    if (this.wybraneStoliki.length > 0) {
      this.pokazDialogRezerwacja = true;
    }
  }

  async zatwierdzRezerwacje(): Promise<void> {
    if (!this.walidujDaneRezerwacji()) {
      return;
    }

    try {
      const rezerwacja: Partial<Rezerwacja> = {
        restauracja_id: this.restauracjaId,
        stoliki_ids: this.wybraneStoliki
          .filter(s => s.stolik_id)
          .map(s => s.stolik_id as number),
        data_rezerwacji: new Date(this.daneRezerwacji.data),
        godzina_od: this.daneRezerwacji.godzinaOd,
        godzina_do: this.daneRezerwacji.godzinaDo,
        imie: this.daneRezerwacji.imie,
        nazwisko: this.daneRezerwacji.nazwisko,
        email: this.daneRezerwacji.email,
        telefon: this.daneRezerwacji.telefon,
        ilosc_osob: this.daneRezerwacji.iloscOsob,
        status: 'oczekująca'
      };

      const stworzona = await this.stolikService.createRezerwacja(rezerwacja);
      
      // Oznacz stoliki jako zarezerwowane
      this.wybraneStoliki.forEach(stolik => {
        stolik.zarezerwowany = true;
        stolik.rezerwacja_id = stworzona.rezerwacja_id;
      });
      
      // Resetuj formularz
      this.wyczyscRezerwacje();
      this.pokazDialogRezerwacja = false;
      
      alert('Rezerwacja została złożona! Sprawdź email.');
      
    } catch (error) {
      console.error('Błąd podczas składania rezerwacji:', error);
      alert('Wystąpił błąd podczas składania rezerwacji.');
    }
  }

  walidujDaneRezerwacji(): boolean {
    if (!this.daneRezerwacji.imie || !this.daneRezerwacji.nazwisko) {
      alert('Proszę podać imię i nazwisko');
      return false;
    }
    
    if (!this.daneRezerwacji.email) {
      alert('Proszę podać email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.daneRezerwacji.email)) {
      alert('Proszę podać poprawny adres email');
      return false;
    }
    
    if (!this.daneRezerwacji.telefon) {
      alert('Proszę podać numer telefonu');
      return false;
    }
    
    const phoneRegex = /^[0-9+\-\s]{9,}$/;
    if (!phoneRegex.test(this.daneRezerwacji.telefon.replace(/\s/g, ''))) {
      alert('Proszę podać poprawny numer telefonu');
      return false;
    }
    
    if (this.daneRezerwacji.iloscOsob > this.sumaMiejsc) {
      alert('Wybrano za mało miejsc dla podanej liczby osób');
      return false;
    }
    
    // Sprawdź czy godzina zakończenia jest późniejsza niż rozpoczęcia
    if (this.daneRezerwacji.godzinaOd >= this.daneRezerwacji.godzinaDo) {
      alert('Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia');
      return false;
    }
    
    return true;
  }

  obliczPozycjeKrzesla(index: number, iloscMiejsc: number, stolik?: Stolik): string {
    let kat = (index / iloscMiejsc) * 360 - 90;
    
    let promien = 52;
    if (stolik) {
      if (stolik.ksztalt === 'okrag') {
        promien = (stolik.promien || 6) * 10 + 20;
      } else {
        promien = Math.max(
          (stolik.szerokosc || 8) * 5,
          (stolik.wysokosc || 8) * 5
        ) + 20;
      }
    } else if (iloscMiejsc > 4) {
      promien = 62;
    }
    
    const radiany = (kat * Math.PI) / 180;
    const x = Math.cos(radiany) * promien;
    const y = Math.sin(radiany) * promien;

    return `translate(${x}px, ${y}px)`;
  }

  get sumaMiejsc(): number {
    return this.wybraneStoliki.reduce((sum, s) => sum + s.ilosc_miejsc, 0);
  }

  wyczyscRezerwacje(): void {
    this.wybraneStoliki = [];
    this.daneRezerwacji = {
      data: this.formatDate(new Date()),
      godzinaOd: '18:00',
      godzinaDo: '20:00',
      imie: '',
      nazwisko: '',
      email: '',
      telefon: '',
      iloscOsob: 1,
      uwagi: ''
    };
  }

  // Pomocnicza funkcja do formatowania godziny
  formatujGodzine(godzina: string): string {
    if (!godzina) return '';
    return godzina.replace(/:00$/, '');
  }

  // Sprawdź czy data jest w przeszłości
  isPastDate(dateString: string): boolean {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  }

  usunStolikZListy(stolik: Stolik): void {
  this.wybraneStoliki = this.wybraneStoliki.filter(st => st !== stolik);
  this.daneRezerwacji.iloscOsob = this.sumaMiejsc;
}
}
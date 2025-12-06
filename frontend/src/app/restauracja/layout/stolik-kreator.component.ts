import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { Stolik, ElementDekoracyjny } from '../../models/stolik.model';

@Component({
  selector: 'app-stolik-kreator',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, FormsModule],
  templateUrl: './stolik-kreator.component.html',
  styleUrls: ['./stolik-kreator.component.scss']
})
export class StolikKreatorComponent implements OnInit {
  @Input() restauracjaId!: number;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() zapisano = new EventEmitter<void>();

  stoliki: Stolik[] = [];
  elementy: ElementDekoracyjny[] = [];
  
  tryb: 'stolik' | 'element' | 'wybor' = 'wybor';
  
  nowyStolik: Partial<Stolik> = {
    ksztalt: 'okrag',
    ilosc_miejsc: 4,
    szerokosc: 8,
    wysokosc: 8,
    promien: 6
  };
  
  nowyElement: Partial<ElementDekoracyjny> = {
    typ: 'okno',
    szerokosc: 10,
    wysokosc: 20,
    kolor: '#4dabf7'
  };
  
  kolory = [
    { value: '#4dabf7', label: 'Niebieski' },
    { value: '#ffa94d', label: 'Pomarańczowy' },
    { value: '#51cf66', label: 'Zielony' },
    { value: '#868e96', label: 'Szary' },
    { value: '#cc5de8', label: 'Fioletowy' },
    { value: '#ff6b6b', label: 'Czerwony' }
  ];
  
  salaClick(event: MouseEvent): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    if (this.tryb === 'stolik') {
      this.dodajStolik(x, y);
    } else if (this.tryb === 'element') {
      this.dodajElement(x, y);
    }
  }
  
  dodajStolik(x: number, y: number): void {
    const stolik: Stolik = {
      restauracja_id: this.restauracjaId,
      pozycja_x: x,
      pozycja_y: y,
      ilosc_miejsc: this.nowyStolik.ilosc_miejsc || 4,
      ksztalt: this.nowyStolik.ksztalt || 'okrag',
      szerokosc: this.nowyStolik.szerokosc || 8,
      wysokosc: this.nowyStolik.wysokosc || 8,
      promien: this.nowyStolik.promien || 6
    };
    
    this.stoliki.push(stolik);
  }
  
  dodajElement(x: number, y: number): void {
    const element: ElementDekoracyjny = {
      restauracja_id: this.restauracjaId,
      typ: this.nowyElement.typ || 'inne',
      pozycja_x: x,
      pozycja_y: y,
      szerokosc: this.nowyElement.szerokosc || 10,
      wysokosc: this.nowyElement.wysokosc || 20,
      kolor: this.nowyElement.kolor || '#cccccc',
      nazwa: this.nowyElement.nazwa || ''
    };
    
    this.elementy.push(element);
  }
  
  usunStolik(index: number): void {
    this.stoliki.splice(index, 1);
  }
  
  usunElement(index: number): void {
    this.elementy.splice(index, 1);
  }
  
  obliczPozycjeKrzesla(index: number, iloscMiejsc: number, stolik: Stolik): string {
    let kat = (index / iloscMiejsc) * 360 - 90;
    
    let promien = 52;
    if (stolik.ksztalt === 'okrag') {
      promien = (stolik.promien || 6) * 10 + 20;
    } else {
      promien = Math.max(
        (stolik.szerokosc || 8) * 5,
        (stolik.wysokosc || 8) * 5
      ) + 20;
    }
    
    const radiany = (kat * Math.PI) / 180;
    const x = Math.cos(radiany) * promien;
    const y = Math.sin(radiany) * promien;

    return `translate(${x}px, ${y}px)`;
  }
  
  zapiszUklad(): void {
    this.zapisano.emit();
    this.visibleChange.emit(false);
  }
  
  anuluj(): void {
    this.visibleChange.emit(false);
  }
  
  ngOnInit(): void {
    this.stoliki = [];
    this.elementy = [];
  }
}
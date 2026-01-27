// src/app/models/rezerwacja.model.ts
export interface CreateRezerwacjaDto {
  restauracja_id: number;
  data: string;           // np. "2025-12-10"
  godzina: string;        // np. "18:30"
  stoliki: number[];      // tablica ID stolików
  liczba_osob: number;
  imie: string;
  telefon: string;
  uzytkownik_id?: number;
}
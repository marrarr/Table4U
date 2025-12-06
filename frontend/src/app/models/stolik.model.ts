// src/app/models/stolik.model.ts
export interface Stolik {
  stolik_id?: number;
  restauracja_id: number;
  pozycja_x: number;      // w procentach (0-100)
  pozycja_y: number;
  ilosc_miejsc: number;
  ksztalt: 'prostokat' | 'okrag';
  szerokosc?: number;     // dla prostokąta (w procentach)
  wysokosc?: number;      // dla prostokąta (w procentach)
  promien?: number;       // dla okręgu (w procentach)
  zarezerwowany?: boolean;
  rezerwacja_id?: number;
}

export interface ElementDekoracyjny {
  element_id?: number;
  restauracja_id: number;
  typ: 'okno' | 'drzwi' | 'bar' | 'ściana' | 'roślina' | 'inne';
  pozycja_x: number;
  pozycja_y: number;
  szerokosc: number;
  wysokosc: number;
  kolor?: string;
  nazwa?: string;
}

export interface Rezerwacja {
  rezerwacja_id?: number;
  restauracja_id: number;
  stoliki_ids: number[];
  data_rezerwacji: Date;
  godzina_od: string;
  godzina_do: string;
  imie: string;
  nazwisko: string;
  email: string;
  telefon: string;
  ilosc_osob: number;
  status: 'oczekująca' | 'potwierdzona' | 'anulowana';
}
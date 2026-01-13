export interface CreateRezerwacjaDto {
  imie: string;
  telefon: string;
  liczba_osob: number;
  stoliki: number[];
  godzina: string;
  data: string;
  restauracja_id: number;
  uzytkownik_id?: number;
}

export interface UpdateRezerwacjaDto {
  uzytkownik_id?: number;
  stolik_id?: number;
  restauracja_id?: number;
  data_utworzenia?: Date;
  data_rezerwacji?: Date;
  godzina_od?: string;
  godzina_do?: string;
  status?: string;
}

export interface CreateUzytkownikDto {
  imie: string;
  nazwisko: string;
  email: string;
  telefon: string;
  login: string;
  haslo: string;
  rola_id: number;
  confirmed: boolean;
}

export interface UpdateUzytkownikDto {
  imie?: string;
  nazwisko?: string;
  email?: string;
  telefon?: string;
  login?: string;
  haslo?: string;
  rola_id?: number;
  confirmed?: boolean;
}
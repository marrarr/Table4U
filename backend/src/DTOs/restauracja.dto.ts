import { Uzytkownik } from "src/uzytkownik/uzytkownik.entity";
export interface CreateRestauracjaDto {
  nazwa: string;
  adres: string;
  nr_kontaktowy: string;
  email: string;
  zdjecie?: Buffer;
  wlasciciele?: Uzytkownik[];
}

export interface UpdateRestauracjaDto {
  restauracja_id?: number;
  nazwa?: string;
  adres?: string;
  nr_kontaktowy?: string;
  email?: string;
  zdjecie?: Buffer;
  wlasciciele?: Uzytkownik[];
}

import { Uzytkownik } from "src/uzytkownik/uzytkownik.entity";

export interface RestauracjaObrazDto {
  id?: number;
  nazwa_pliku: string;
  typ: string;
  rozmiar: number;
  czy_glowne?: boolean;
  obrazBase64?: string;
}

export interface CreateRestauracjaDto {
  nazwa: string;
  adres: string;
  nr_kontaktowy: string;
  email: string;
  wlasciciele?: Uzytkownik[];
  obrazy?: RestauracjaObrazDto[];
}

export interface UpdateRestauracjaDto {
  restauracja_id?: number;
  nazwa?: string;
  adres?: string;
  nr_kontaktowy?: string;
  email?: string;
  wlasciciele?: Uzytkownik[];
  obrazy?: RestauracjaObrazDto[];
}

export interface RestauracjaApiDto {
  restauracja_id: number;
  nazwa: string;
  adres: string;
  nr_kontaktowy: string;
  email: string;
  obrazy: {
    id: number;
    nazwa_pliku: string;
    typ: string;
    rozmiar: number;
    czy_glowne: boolean;
    obrazBase64?: string;
  }[];
}

export interface CreateRestauracjaDto {
  nazwa: string;
  adres: string;
  nr_kontaktowy: string;
  email: string;
}

export interface Restauracja {
  restauracja_id?: number;
  nazwa?: string;
  adres?: string;
  nr_kontaktowy?: string;
  email?: string;
  obraz?: RestauracjaObraz | null;
}

export interface RestauracjaObraz {
  id?: number;
  nazwa_pliku?: string;
  typ?: string;
  rozmiar?: number;
  czy_glowne?: boolean;
  obrazBase64?: string;
}

export interface CreateRestauracjaDto {
  nazwa: string;
  adres: string;
  nr_kontaktowy: string;
  email: string;
  zdjecie?: Buffer;
}

export interface UpdateRestauracjaDto {
  nazwa?: string;
  adres?: string;
  nr_kontaktowy?: string;
  email?: string;
  zdjecie?: Buffer;
}

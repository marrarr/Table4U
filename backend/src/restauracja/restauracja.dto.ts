export class CreateRestauracjaDto {
  nazwa: string;
  adres: string;
  nr_kontaktowy: string;
  email: string;
  zdjecie?: Buffer;
}

export class UpdateRestauracjaDto {
  nazwa?: string;
  adres?: string;
  nr_kontaktowy?: string;
  email?: string;
  zdjecie?: Buffer;
}

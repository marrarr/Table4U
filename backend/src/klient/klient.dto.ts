export class CreateKlientDto {
  imie: string;
  nazwisko: string;
  telefon: string;
  email: string;
}

export class UpdateKlientDto {
  imie?: string;
  nazwisko?: string;
  telefon?: string;
  email?: string;
}

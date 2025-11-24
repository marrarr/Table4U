export class CreatePracownikDto {
  imie: string;
  nazwisko: string;
  rola: string;
  login: string;
  haslo: string;
}

export class UpdatePracownikDto {
  imie?: string;
  nazwisko?: string;
  rola?: string;
  login?: string;
  haslo?: string;
}

export class CreateStolikDto {
  numer_stolika: number;
  ilosc_miejsc: number;
  lokalizacja: string;
}

export class UpdateStolikDto {
  numer_stolika?: number;
  ilosc_miejsc?: number;
  lokalizacja?: string;
}

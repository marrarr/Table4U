export interface CreateStolikDto {
  numer_stolika: number;
  ilosc_miejsc: number;
  lokalizacja: string;
}

export interface UpdateStolikDto {
  numer_stolika?: number;
  ilosc_miejsc?: number;
  lokalizacja?: string;
}

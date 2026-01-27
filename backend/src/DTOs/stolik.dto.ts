export interface CreateStolikDto {
  numer_stolika: number;
  ilosc_miejsc: number;
  lokalizacja: string;
  pozycjaX_UI: number;
  pozycjaY_UI: number;
  restauracja_id: number;
}

export interface UpdateStolikDto {
  numer_stolika?: number;
  ilosc_miejsc?: number;
  lokalizacja?: string;
  pozycjaX_UI?: number;
  pozycjaY_UI?: number;
  restauracja_id?: number;
}

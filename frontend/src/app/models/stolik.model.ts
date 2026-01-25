export interface Stolik {
  stolik_id: number;
  numer_stolika: number;
  ilosc_miejsc: number;
  lokalizacja: string; // To pole jest wymagane do edycji
  pozycjaX_UI: number;
  pozycjaY_UI: number;
  restauracja_id?: number;
}
export class CreateRezerwacjaDto {
  klient_id: number;
  pracownik_id: number;
  stolik_id: number;
  restauracja_id: number;
  data_utworzenia: Date;
  data_rezerwacji: Date;
  godzina_od: string;
  godzina_do: string;
  status: string;
}

export class UpdateRezerwacjaDto {
  klient_id?: number;
  pracownik_id?: number;
  stolik_id?: number;
  restauracja_id?: number;
  data_utworzenia?: Date;
  data_rezerwacji?: Date;
  godzina_od?: string;
  godzina_do?: string;
  status?: string;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Rezerwacja {
  rezerwacja_id: number;
  imie: string;
  telefon: string;
  liczba_osob: number;
  stoliki: number[];
  godzina: string;
  data: string;
  restauracja_id: number;
  status: string;
  uzytkownik_id?: number;
  restauracja?: {
    restauracja_id: number;
    nazwa: string;
    adres: string;
  };
  uzytkownik?: {
    uzytkownik_id: number;
    username: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RezerwacjeService {
  private baseUrl = 'http://localhost:3000/rezerwacja';

  constructor(private http: HttpClient) {}

  async getMyRezerwacje(): Promise<Rezerwacja[]> {
    console.log('RezerwacjeService: calling API /rezerwacja/moje');
    try {
      const result = await firstValueFrom(
        this.http.get<Rezerwacja[]>(`${this.baseUrl}/moje`)
      );
      console.log('RezerwacjeService: API response:', result);
      return result;
    } catch (error) {
      console.error('RezerwacjeService: API error:', error);
      throw error;
    }
  }

  async updateStatus(rezerwacja_id: number, status: string): Promise<Rezerwacja> {
    return firstValueFrom(
      this.http.put<Rezerwacja>(`${this.baseUrl}/${rezerwacja_id}`, { status })
    );
  }

  async updateRezerwacja(rezerwacja_id: number, payload: Partial<Rezerwacja>): Promise<Rezerwacja> {
    return firstValueFrom(
      this.http.put<Rezerwacja>(`${this.baseUrl}/${rezerwacja_id}`, payload)
    );
  }
}

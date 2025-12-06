// src/app/restauracja/layout/stolik.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Stolik, ElementDekoracyjny, Rezerwacja } from '../../models/stolik.model';

@Injectable({
  providedIn: 'root'
})
export class StolikService {
  private apiUrl = 'http://localhost:3000/stolik';
  private apiElementy = 'http://localhost:3000/elementy';
  private apiRezerwacje = 'http://localhost:3000/rezerwacje';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  // Stoliki
  getStoliki(restauracjaId: number): Promise<Stolik[]> {
    return firstValueFrom(
      this.http.get<Stolik[]>(
        `${this.apiUrl}/restauracja/${restauracjaId}`,
        { headers: this.getAuthHeaders() }
      )
    );
  }

  zapiszUklad(restauracjaId: number, stoliki: Stolik[]): Promise<any> {
    return firstValueFrom(
      this.http.post(
        `${this.apiUrl}/uklad/${restauracjaId}`,
        { stoliki },
        { headers: this.getAuthHeaders() }
      )
    );
  }

  // Elementy dekoracyjne
  getElementy(restauracjaId: number): Promise<ElementDekoracyjny[]> {
    return firstValueFrom(
      this.http.get<ElementDekoracyjny[]>(
        `${this.apiElementy}/restauracja/${restauracjaId}`,
        { headers: this.getAuthHeaders() }
      )
    );
  }

  zapiszElementy(restauracjaId: number, elementy: ElementDekoracyjny[]): Promise<any> {
    return firstValueFrom(
      this.http.post(
        `${this.apiElementy}/uklad/${restauracjaId}`,
        { elementy },
        { headers: this.getAuthHeaders() }
      )
    );
  }

  // Rezerwacje
  getRezerwacje(restauracjaId: number, data?: Date): Promise<Rezerwacja[]> {
    let url = `${this.apiRezerwacje}/restauracja/${restauracjaId}`;
    if (data) {
      url += `?data=${data.toISOString().split('T')[0]}`;
    }
    
    return firstValueFrom(
      this.http.get<Rezerwacja[]>(url, { headers: this.getAuthHeaders() })
    );
  }

  createRezerwacja(rezerwacja: Partial<Rezerwacja>): Promise<Rezerwacja> {
    return firstValueFrom(
      this.http.post<Rezerwacja>(
        this.apiRezerwacje,
        rezerwacja,
        { headers: this.getAuthHeaders() }
      )
    );
  }

  // Sprawdzenie dostępności stolików
  sprawdzDostepnosc(restauracjaId: number, data: Date, godzinaOd: string, godzinaDo: string): Promise<Stolik[]> {
    return firstValueFrom(
      this.http.post<Stolik[]>(
        `${this.apiUrl}/dostepnosc/${restauracjaId}`,
        { data, godzinaOd, godzinaDo },
        { headers: this.getAuthHeaders() }
      )
    );
  }
}
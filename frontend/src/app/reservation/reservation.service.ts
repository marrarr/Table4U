import { CreateRezerwacjaDto } from "../models/rezerwacja.model";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { firstValueFrom } from "rxjs";


@Injectable()
export class ReservationService {
  private apiUrl = 'http://localhost:3000/rezerwacja'; 

  constructor(private http: HttpClient) {}

  create(data: CreateRezerwacjaDto): Promise<CreateRezerwacjaDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return firstValueFrom(this.http.post<CreateRezerwacjaDto>(this.apiUrl, data, { headers }));
  }

  getAll(): Promise<CreateRezerwacjaDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return firstValueFrom(this.http.get<CreateRezerwacjaDto[]>(this.apiUrl, { headers }));
  }

  getOne(id: number): Promise<CreateRezerwacjaDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return firstValueFrom(this.http.get<CreateRezerwacjaDto>(`${this.apiUrl}/${id}`, { headers }));
  }

  delete(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }));
  }

  // Fetch reservations for a given restaurant, date, and hour
  getOccupied(restauracja_id: number, data: string, godzina: string): Promise<CreateRezerwacjaDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const params = { restauracja_id, data, godzina };
    return firstValueFrom(this.http.get<CreateRezerwacjaDto[]>(`${this.apiUrl}/occupied`, { headers, params }));
  }

}
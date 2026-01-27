import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restauracja } from '../models/restauracja.model';

@Injectable({
  providedIn: 'root'
})
export class RestauracjaService {
  private apiUrl = 'http://localhost:3000/restauracja'; // Dostosuj URL do swojego backendu

  constructor(private http: HttpClient) {}

  getRestauracje(): Observable<Restauracja[]> {
    return this.http.get<Restauracja[]>(this.apiUrl);
  }

  getRestauracjaById(id: number): Observable<Restauracja> {
    return this.http.get<Restauracja>(`${this.apiUrl}/${id}`);
  }
}
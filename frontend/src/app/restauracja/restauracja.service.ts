import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restauracja } from '../models/restauracja.model';
import { CreateRestauracjaDto } from '../models/restauracja.model';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class RestauracjaService {
  private apiUrl = 'http://localhost:3000/restauracja';                            //adres endpointu API do zarządzania restauracjami                   

  constructor(private http: HttpClient) {}

  getAllRestaurants(): Promise<Restauracja[]> {                                     //metoda pobierająca listę wszystkich restauracji                 
    return firstValueFrom(this.http.get<Restauracja[]>(this.apiUrl));
  }
  createRestaurant(data: Partial<CreateRestauracjaDto>): Promise<Restauracja> {    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });       
    return firstValueFrom(this.http.post<CreateRestauracjaDto>(this.apiUrl, data, { headers }));
  }
  updateRestaurant(id: number, data: Partial<Restauracja>): Promise<Restauracja> {
  return firstValueFrom(this.http.put<Restauracja>(`${this.apiUrl}/${id}`, data));
}
  getMyRestaurants(): Promise<Restauracja[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return firstValueFrom(this.http.get<Restauracja[]>(`${this.apiUrl}/moje`, { headers }));
  }
}

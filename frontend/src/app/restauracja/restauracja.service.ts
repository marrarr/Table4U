import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restauracja } from '../models/restauracja.model';
import { CreateRestauracjaDto } from '../models/restauracja.model';
import { firstValueFrom } from 'rxjs';

// Interface dla stolika
interface CreateStolikDto {
  id: number;
  seats: number;
  top: number;
  left: number;
}

@Injectable({
  providedIn: 'root',
})
export class RestauracjaService {
  private apiUrl = 'http://localhost:3000/restauracja';

  constructor(private http: HttpClient) {}

  getAllRestaurants(): Promise<Restauracja[]> {
    return firstValueFrom(this.http.get<Restauracja[]>(this.apiUrl));
  }

  createRestaurant(data: CreateRestauracjaDto | FormData): Promise<Restauracja> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      // Nie ustawiaj Content-Type dla FormData - browser zrobi to automatycznie
    });
    return firstValueFrom(this.http.post<Restauracja>(this.apiUrl, data, { headers }));
  }

  updateRestaurant(id: number, data: Partial<Restauracja>): Promise<Restauracja> {
    // Don't send image data when updating basic restauracja fields
    (data as any).obraz = undefined;
    return firstValueFrom(this.http.put<Restauracja>(`${this.apiUrl}/${id}`, data));
  }

  getMyRestaurants(): Promise<Restauracja[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return firstValueFrom(this.http.get<Restauracja[]>(`${this.apiUrl}/moje`, { headers }));
  }

  // NOWA METODA: Zapisywanie układu stolików
  saveTableLayout(restauracjaId: number, stoliki: CreateStolikDto[]): Promise<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/${restauracjaId}/stoliki`, stoliki, { headers })
    );
  }

  uploadImage(restauracjaId: number, file: File): Promise<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const form = new FormData();
    form.append('obraz', file);
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/${restauracjaId}/obraz`, form, { headers }));
  }

  deleteImage(restauracjaId: number, obrazId: number): Promise<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return firstValueFrom(this.http.delete<any>(`${this.apiUrl}/${restauracjaId}/obraz/${obrazId}`, { headers }));
  }
}
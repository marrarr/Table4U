import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private apiUrl = 'http://localhost:3000/restaurants'; // URL Twojego backendu

  constructor(private http: HttpClient) {}

  getAllRestaurants(): Promise<Restaurant[]> {
    return firstValueFrom(this.http.get<Restaurant[]>(this.apiUrl));
  }
  createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
    return firstValueFrom(this.http.post<Restaurant>(this.apiUrl, data));
  }
}

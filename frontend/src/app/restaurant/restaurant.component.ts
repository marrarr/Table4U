import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from '../models/restaurant.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonModule, HttpClientModule, CommonModule, DialogModule, FormsModule],
  providers: [RestaurantService],
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss'],
  
})
export class RestaurantComponent {
  constructor(private restaurantService: RestaurantService) {}
  protected readonly title = signal('Witaj na stronie restauracji!');

  restaurant: Restaurant[] = [];
  addingDialog = false;


  newRestaurant: Restaurant = {
    id: 0,
    name: '',
    address: '',
    rating: 0
  };

  async getRestaurant()
  {
    try {
      this.restaurant = await this.restaurantService.getAllRestaurants();
    } catch (error) {
      console.error('Błąd podczas pobierania restauracji:', error);
    }
  }

  async saveRestaurant() {
    if (
      this.newRestaurant.name &&
      this.newRestaurant.address &&
      this.newRestaurant.rating != null
    ) {
      try {
        const created = await this.restaurantService.createRestaurant(this.newRestaurant);
        this.restaurant.push(created); 
        this.newRestaurant = {
          id: 0,
          name: '',
          address: '',
          rating: 0
        };; 
        this.addingDialog = false; 
      } catch (error) {
        console.error('Błąd przy dodawaniu restauracji:', error);
      }
    } else {
      alert('Wypełnij wszystkie pola!');
    }
  }
  
}

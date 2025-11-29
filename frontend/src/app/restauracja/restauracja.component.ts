import { Component, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RestauracjaService } from './restauracja.service';
import { Restauracja, CreateRestauracjaDto } from '../models/restauracja.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonModule, InputTextModule, HttpClientModule, CommonModule, DialogModule, FormsModule],
  providers: [RestauracjaService],
  templateUrl: './restauracja.component.html',
  styleUrls: ['./restauracja.component.scss'],
})
export class RestauracjaComponent implements OnInit {
  constructor(private restauracjaService: RestauracjaService) { }
  protected readonly title = signal('Witaj na stronie restauracji!');

  restaurant: Restauracja[] = [];
  addingDialog = false;
  editingDialog = false;

  newRestaurant: CreateRestauracjaDto = {
    nazwa: '',
    adres: '',
    nr_kontaktowy: '',
    email: '',
    zdjecie: null
  };

  editedRestaurant: Restauracja = {
    restauracja_id: 0,
    nazwa: '',
    adres: '',
    nr_kontaktowy: '',
    email: '',
    zdjecie: null
  };

  ngOnInit() {
    this.getRestaurant();
  }

  async getRestaurant() {
  try {
    this.restaurant = await this.restauracjaService.getMyRestaurants();
  } catch (error) {
    console.error('Błąd podczas pobierania restauracji:', error);
  }
}

  async saveRestaurant() {
    if (this.newRestaurant.nazwa && this.newRestaurant.adres && this.newRestaurant.nr_kontaktowy && this.newRestaurant.email) {
      try {
        this.newRestaurant.zdjecie = '0';
        const created = await this.restauracjaService.createRestaurant(this.newRestaurant);
        this.restaurant.push(created);
        this.newRestaurant = {
          nazwa: '',
          adres: '',
          nr_kontaktowy: '',
          email: '',
          zdjecie: null
        };
        this.addingDialog = false;
      } catch (error) {
        console.error('Błąd przy dodawaniu restauracji:', error);
      }
    } else {
      alert('Wypełnij wszystkie pola!');
    }
  }

  openEditDialog(restaurant: Restauracja) {
    this.editedRestaurant = { ...restaurant }; 
    this.editingDialog = true;
  }
  
  async updateRestaurant() {
  try {
    const updated = await this.restauracjaService.updateRestaurant(
      this.editedRestaurant.restauracja_id!,
      this.editedRestaurant
    );

    
    const index = this.restaurant.findIndex(r => r.restauracja_id === updated.restauracja_id);
    if (index !== -1) this.restaurant[index] = updated;

    this.editingDialog = false;

  } catch (error) {
    console.error('Błąd podczas aktualizacji restauracji:', error);
  }
}
}


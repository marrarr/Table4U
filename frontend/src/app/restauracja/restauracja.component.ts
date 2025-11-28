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

  newRestaurant: CreateRestauracjaDto = {
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
      this.restaurant = await this.restauracjaService.getAllRestaurants();
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
}
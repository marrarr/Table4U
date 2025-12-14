import { Component, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RestauracjaService } from './restauracja.service';
import { Restauracja, CreateRestauracjaDto } from '../models/restauracja.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';

// Importujemy komponent dialogu oraz interfejs Table
import { ReservationDialogComponent, Table } from '../reservation/reservation-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ButtonModule, 
    InputTextModule, 
    HttpClientModule, 
    CommonModule, 
    DialogModule, 
    FormsModule, 
    ReservationDialogComponent
  ],
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

  // Zmienne do obsługi dialogu układu sali (Floor Plan)
  floorPlanDialogVisible = false;
  currentRestaurantForLayout: Restauracja | null = null;

  newRestaurant: CreateRestauracjaDto = {
    nazwa: '',
    adres: '',
    nr_kontaktowy: '',
    email: '',
  };

  editedRestaurant: Restauracja = {
    restauracja_id: 0,
    nazwa: '',
    adres: '',
    nr_kontaktowy: '',
    email: '',
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

        const created = await this.restauracjaService.createRestaurant(this.newRestaurant);
        this.restaurant.push(created);
        
        // 2. Resetujemy formularz
        this.newRestaurant = {
          nazwa: '',
          adres: '',
          nr_kontaktowy: '',
          email: '',
        };
        
        // 3. Zamykamy okno dodawania
        this.addingDialog = false;

        // 4. === NOWOŚĆ === 
        // Otwieramy edytor układu sali dla nowo utworzonej restauracji
        setTimeout(() => {
          this.openFloorPlanEditor(created);
        }, 300);

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

      // Otwarcie edytora po edycji (to już miałeś)
      setTimeout(() => {
        this.openFloorPlanEditor(updated);
      }, 300);

    } catch (error) {
      console.error('Błąd podczas aktualizacji restauracji:', error);
    }
  }

  // --- Metody do obsługi edytora sali ---

  openFloorPlanEditor(restaurant: Restauracja) {
    this.currentRestaurantForLayout = restaurant;
    this.floorPlanDialogVisible = true;
  }
}

  getMainImage(restaurant: Restauracja) {
    if (!restaurant.obrazy) return null;
    return restaurant.obrazy.find(o => o.czy_glowne) || null;
  }

}

  onLayoutSaved(newTables: Table[]) {
    console.log('Zapisano nowy układ dla restauracji:', this.currentRestaurantForLayout?.nazwa);
    console.log('Nowe współrzędne stolików:', newTables);

    // TODO: Wywołaj serwis zapisujący układ w bazie, np.:
    // this.restauracjaService.saveTableLayout(this.currentRestaurantForLayout.restauracja_id, newTables);

    this.floorPlanDialogVisible = false;
    this.currentRestaurantForLayout = null;
  }
}
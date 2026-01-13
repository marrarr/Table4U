import { Component, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RestauracjaService } from './restauracja.service';
import { Restauracja, CreateRestauracjaDto } from '../models/restauracja.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
// Dodano moduł do uploadu plików
import { FileUploadModule } from 'primeng/fileupload';

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
    ReservationDialogComponent,
    FileUploadModule // Dodano tutaj
  ],
  providers: [RestauracjaService],
  templateUrl: './restauracja.component.html',
  styleUrls: ['./restauracja.component.scss'],
})
export class RestauracjaComponent implements OnInit {
  constructor(private restauracjaService: RestauracjaService) { }
  protected readonly title = signal('Witaj na stronie restauracji!');

  restauracje: Restauracja[] = [];
  addingDialog = false;
  editingDialog = false;

  // Zmienna do przechowywania wybranych plików (zdjęć)
  selectedFiles: File[] = [];

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
      this.restauracje = await this.restauracjaService.getMyRestaurants();
    } catch (error) {
      console.error('Błąd podczas pobierania restauracji:', error);
    }
  }

  // Metoda wywoływana, gdy użytkownik wybierze zdjęcia w formularzu
  onNewFilesSelected(event: any) {
    // PrimeNG zwraca wybrane pliki w event.currentFiles
    this.selectedFiles = event.currentFiles;
  }

  async saveRestaurant() {
    if (this.newRestaurant.nazwa && this.newRestaurant.adres && this.newRestaurant.nr_kontaktowy && this.newRestaurant.email) {
      try {
        // === ZMIANA: Użycie FormData do przesłania danych i zdjęć ===
        const formData = new FormData();
        
        // Dodajemy pola tekstowe
        formData.append('nazwa', this.newRestaurant.nazwa);
        formData.append('adres', this.newRestaurant.adres);
        formData.append('nr_kontaktowy', this.newRestaurant.nr_kontaktowy);
        formData.append('email', this.newRestaurant.email);

        // Dodajemy wybrane zdjęcia
        if (this.selectedFiles && this.selectedFiles.length > 0) {
          for (let file of this.selectedFiles) {
            // Klucz 'images' musi pasować do tego, czego oczekuje Twój backend (np. @UploadedFiles w NestJS)
            formData.append('images', file);
          }
        }

        // UWAGA: Twoja metoda service.createRestaurant musi teraz przyjmować FormData
        // Jeśli TypeScript zgłasza błąd typu, musisz zaktualizować definicję w serwisie.
        // Tutaj rzutuję na 'any', aby uniknąć błędu kompilacji w tym pliku, 
        // ale w serwisie należy zmienić typ argumentu z CreateRestauracjaDto na FormData.
        const created = await this.restauracjaService.createRestaurant(formData as any);
        
        this.restauracje.push(created);

        // 2. Resetujemy formularz i pliki
        this.newRestaurant = {
          nazwa: '',
          adres: '',
          nr_kontaktowy: '',
          email: '',
        };
        this.selectedFiles = []; // Czyścimy listę plików

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

      const index = this.restauracje.findIndex(r => r.restauracja_id === updated.restauracja_id);
      if (index !== -1) this.restauracje[index] = updated;

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

  getMainImage(restaurant: Restauracja) {
    // Zabezpieczenie na wypadek, gdyby obrazy były undefined
    if (!restaurant.obrazy || restaurant.obrazy.length === 0) return null;
    return restaurant.obrazy.find(o => o.czy_glowne) || restaurant.obrazy[0];
  }

  onLayoutSaved(newTables: Table[]) {

    // TODO: Wywołaj serwis zapisujący układ w bazie, np.:
    // this.restauracjaService.saveTableLayout(this.currentRestaurantForLayout.restauracja_id, newTables);

    this.floorPlanDialogVisible = false;
    this.currentRestaurantForLayout = null;
  }
}
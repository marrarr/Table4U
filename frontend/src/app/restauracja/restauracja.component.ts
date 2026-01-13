import { Component, signal, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RestauracjaService } from './restauracja.service';
import { Restauracja, CreateRestauracjaDto } from '../models/restauracja.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
    FileUploadModule,
    ToastModule
  ],
  providers: [RestauracjaService, MessageService],
  templateUrl: './restauracja.component.html',
  styleUrls: ['./restauracja.component.scss'],
})
export class RestauracjaComponent implements OnInit {
  constructor(
    private restauracjaService: RestauracjaService,
    private messageService: MessageService
  ) {}
  
  protected readonly title = signal('Witaj na stronie restauracji!');

  restauracje: Restauracja[] = [];
  addingDialog = false;
  editingDialog = false;

  selectedFiles: File[] = [];

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

  onNewFilesSelected(event: any) {
    this.selectedFiles = event.currentFiles;
  }

  async saveRestaurant() {
    if (this.newRestaurant.nazwa && this.newRestaurant.adres && this.newRestaurant.nr_kontaktowy && this.newRestaurant.email) {
      try {
        const formData = new FormData();
        
        formData.append('nazwa', this.newRestaurant.nazwa);
        formData.append('adres', this.newRestaurant.adres);
        formData.append('nr_kontaktowy', this.newRestaurant.nr_kontaktowy);
        formData.append('email', this.newRestaurant.email);

        if (this.selectedFiles && this.selectedFiles.length > 0) {
          for (let file of this.selectedFiles) {
            formData.append('images', file);
          }
        }

        const created = await this.restauracjaService.createRestaurant(formData as any);
        
        this.restauracje.push(created);

        this.newRestaurant = {
          nazwa: '',
          adres: '',
          nr_kontaktowy: '',
          email: '',
        };
        this.selectedFiles = [];

        this.addingDialog = false;

        // Otwórz edytor układu sali
        setTimeout(() => {
          this.openFloorPlanEditor(created);
        }, 300);

      } catch (error) {
        console.error('Błąd przy dodawaniu restauracji:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się dodać restauracji'
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Uwaga',
        detail: 'Wypełnij wszystkie pola!'
      });
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

      // Otwórz edytor układu po edycji
      setTimeout(() => {
        this.openFloorPlanEditor(updated);
      }, 300);

    } catch (error) {
      console.error('Błąd podczas aktualizacji restauracji:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się zaktualizować restauracji'
      });
    }
  }

  openFloorPlanEditor(restaurant: Restauracja) {
    this.currentRestaurantForLayout = restaurant;
    this.floorPlanDialogVisible = true;
  }

  getMainImage(restaurant: Restauracja) {
    if (!restaurant.obrazy || restaurant.obrazy.length === 0) return null;
    return restaurant.obrazy.find(o => o.czy_glowne) || restaurant.obrazy[0];
  }

  // ZAIMPLEMENTOWANA METODA - zapisuje układ stolików do bazy
  async onLayoutSaved(newTables: Table[]) {
    if (!this.currentRestaurantForLayout) {
      this.floorPlanDialogVisible = false;
      return;
    }

    const restauracjaId = this.currentRestaurantForLayout.restauracja_id!;

    // Przygotuj dane stolików do wysłania
    const stolikData = newTables.map(table => ({
      id: table.id,
      seats: table.seats,
      top: table.top,
      left: table.left
    }));

    try {
      await this.restauracjaService.saveTableLayout(restauracjaId, stolikData);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sukces',
        detail: `Zapisano układ ${newTables.length} stolików`
      });

    } catch (error) {
      console.error('Błąd podczas zapisywania układu:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się zapisać układu stolików'
      });
    }

    this.floorPlanDialogVisible = false;
    this.currentRestaurantForLayout = null;
  }
}
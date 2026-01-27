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
  editSelectedFile: File | null = null;

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
  onEditFileSelected(event: any) {
    const file = event.target.files && event.target.files[0];
    this.editSelectedFile = file || null;
  }

  async updateRestaurant() {
    try {
      const updated = await this.restauracjaService.updateRestaurant(
        this.editedRestaurant.restauracja_id!,
        this.editedRestaurant
      );

      // Jeśli wybrano nowy plik do edycji, prześlij go
      if (this.editSelectedFile) {
        try {
          const obraz = await this.restauracjaService.uploadImage(updated.restauracja_id!, this.editSelectedFile);
          // zaktualizuj pole obraz w zwróconym obiekcie
          (updated as any).obraz = obraz;
        } catch (err) {
          console.error('Błąd przy przesyłaniu obrazu:', err);
        }
      }

      const index = this.restauracje.findIndex(r => r.restauracja_id === updated.restauracja_id);
      if (index !== -1) this.restauracje[index] = updated;

      this.editingDialog = false;
      this.editSelectedFile = null;

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

  async deleteRestaurant(restaurant: Restauracja) {
    if (!restaurant.restauracja_id) return;
    const confirm = window.confirm(`Czy napewno usunąć restaurację "${restaurant.nazwa}"?`);
    if (!confirm) return;
    console.log('Usuwam restaurację id=', restaurant.restauracja_id);
    try {
      await this.restauracjaService.deleteRestaurant(restaurant.restauracja_id);
      // odśwież listę z serwera, żeby mieć spójny stan
      await this.getRestaurant();
      this.messageService.add({ severity: 'success', summary: 'Sukces', detail: 'Usunięto restaurację' });
    } catch (err: any) {
      console.error('Błąd przy usuwaniu restauracji:', err);
      const detail = err?.error?.message || err?.message || 'Nie udało się usunąć restauracji';
      this.messageService.add({ severity: 'error', summary: 'Błąd', detail });
    }
  }

  async deleteImage(restaurant: Restauracja) {
    if (!restaurant.restauracja_id || !restaurant.obraz) return;
    try {
      await this.restauracjaService.deleteImage(restaurant.restauracja_id, restaurant.obraz.id!);
      // zaktualizuj lokalnie
      const index = this.restauracje.findIndex(r => r.restauracja_id === restaurant.restauracja_id);
      if (index !== -1) this.restauracje[index].obraz = null;
      if (this.editedRestaurant && this.editedRestaurant.restauracja_id === restaurant.restauracja_id) {
        this.editedRestaurant.obraz = null;
      }
    } catch (err) {
      console.error('Błąd przy usuwaniu obrazu:', err);
      this.messageService.add({ severity: 'error', summary: 'Błąd', detail: 'Nie udało się usunąć obrazu' });
    }
  }

  openFloorPlanEditor(restaurant: Restauracja) {
    this.currentRestaurantForLayout = restaurant;
    this.floorPlanDialogVisible = true;
  }

  getMainImage(restaurant: Restauracja) {
    if (!restaurant.obraz) return null;
    return restaurant.obraz;
  }

  // ZAIMPLEMENTOWANA METODA - zapisuje układ stolików do bazy
  async onLayoutSaved(newTables: Table[]) {
    if (!this.currentRestaurantForLayout) {
      this.floorPlanDialogVisible = false;
      return;
    }

    const restauracjaId = this.currentRestaurantForLayout.restauracja_id!;

    try {
      // Pobierz aktualne stoliki z serwera, żeby wiedzieć, które usunąć
      const existing: any[] = await this.restauracjaService.getTables(restauracjaId);

      const existingIds = existing.map(e => e.stolik_id).filter(Boolean) as number[];

      // Mapuj nowe tabele: sprawdzamy serverId (jeśli jest) oraz przygotowujemy payload
      const newServerIds = newTables.map(t => (t as any).serverId).filter(Boolean) as number[];

      // Usuń stoliki, które były na serwerze, ale nie ma ich już w newTables
      const toDelete = existing.filter(e => !newServerIds.includes(e.stolik_id));
      for (const del of toDelete) {
        try {
          await this.restauracjaService.deleteStolik(del.stolik_id);
        } catch (err) {
          console.warn('Nie udało się usunąć stolika', del.stolik_id, err);
        }
      }

      // Aktualizuj lub twórz stoliki
      for (const t of newTables) {
        const payload = {
          numer_stolika: t.id,
          ilosc_miejsc: t.seats,
          lokalizacja: t.lokalizacja || 'Sala główna',
          pozycjaX_UI: t.left,
          pozycjaY_UI: t.top,
          restauracja_id: restauracjaId,
        };

        if ((t as any).serverId) {
          // update existing
          try {
            await this.restauracjaService.updateStolik((t as any).serverId, payload);
          } catch (err) {
            console.warn('Błąd aktualizacji stolika', (t as any).serverId, err);
          }
        } else {
          // create new
          try {
            await this.restauracjaService.createStolik(payload);
          } catch (err) {
            console.warn('Błąd tworzenia stolika', payload, err);
          }
        }
      }

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
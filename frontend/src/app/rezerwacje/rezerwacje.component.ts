import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RezerwacjeService, Rezerwacja } from './rezerwacje.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-rezerwacje',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './rezerwacje.component.html',
  styleUrls: ['./rezerwacje.component.scss']
})
export class RezerwacjeComponent implements OnInit {
  rezerwacje: Rezerwacja[] = [];
  userRole: string | null = null;
  loading = false;
  editDialogVisible = false;
  editedRezerwacja: Rezerwacja | null = null;

  constructor(
    private rezerwacjeService: RezerwacjeService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    console.log('RezerwacjeComponent ngOnInit');
    
    // Sprawdź token przy inicjalizacji
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    this.authService.userRole$.subscribe(role => {
      console.log('User role changed (observable):', role);
      // jeśli observable ma wartość, użyj jej
      if (role) {
        this.userRole = role;
      } else {
        // fallback: spróbuj odczytać rolę bezpośrednio z tokena
        const fallback = this.authService.getRoleFromToken();
        console.log('User role fallback from token:', fallback);
        this.userRole = fallback;
      }
    });
    
    // Jeśli jest token, załaduj rezerwacje niezależnie od roli
    if (token) {
      this.loadRezerwacje();
    }
  }

  async loadRezerwacje() {
    this.loading = true;
    console.log('Loading rezerwacje...');
    try {
      this.rezerwacje = await this.rezerwacjeService.getMyRezerwacje();
      console.log('Loaded rezerwacje:', this.rezerwacje);
    } catch (error) {
      console.error('Błąd podczas ładowania rezerwacji:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się załadować rezerwacji'
      });
    } finally {
      this.loading = false;
    }
  }

  async anulujRezerwacje(rezerwacja: Rezerwacja) {
    try {
      await this.rezerwacjeService.updateStatus(rezerwacja.rezerwacja_id, 'anulowana');
      this.messageService.add({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Rezerwacja została anulowana'
      });
      await this.loadRezerwacje();
    } catch (error) {
      console.error('Błąd podczas anulowania rezerwacji:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się anulować rezerwacji'
      });
    }
  }

  openEditDialog(rezerwacja: Rezerwacja) {
    this.editedRezerwacja = { ...rezerwacja };
    this.editDialogVisible = true;
  }

  async saveEdit() {
    if (!this.editedRezerwacja) return;
    try {
      const payload: Partial<Rezerwacja> = {
        imie: this.editedRezerwacja.imie,
        telefon: this.editedRezerwacja.telefon,
        data: this.editedRezerwacja.data,
        godzina: this.editedRezerwacja.godzina,
        liczba_osob: this.editedRezerwacja.liczba_osob,
      };
      await this.rezerwacjeService.updateRezerwacja(this.editedRezerwacja.rezerwacja_id, payload);
      this.messageService.add({ severity: 'success', summary: 'Sukces', detail: 'Rezerwacja zaktualizowana' });
      this.editDialogVisible = false;
      await this.loadRezerwacje();
    } catch (error) {
      console.error('Błąd podczas zapisywania rezerwacji:', error);
      this.messageService.add({ severity: 'error', summary: 'Błąd', detail: 'Nie udało się zapisać zmian' });
    }
  }

  async potwierdzRezerwacje(rezerwacja: Rezerwacja) {
    try {
      await this.rezerwacjeService.updateStatus(rezerwacja.rezerwacja_id, 'zatwierdzona');
      this.messageService.add({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Rezerwacja została potwierdzona'
      });
      await this.loadRezerwacje();
    } catch (error) {
      console.error('Błąd podczas potwierdzania rezerwacji:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się potwierdzić rezerwacji'
      });
    }
  }

  canCancel(rezerwacja: Rezerwacja): boolean {
    // Można anulować tylko jeśli nie jest już anulowana
    return rezerwacja.status !== 'anulowana';
  }

  canConfirm(rezerwacja: Rezerwacja): boolean {
    // Owner może potwierdzić tylko jeśli nie jest anulowana lub już zatwierdzona
    return rezerwacja.status !== 'anulowana' && rezerwacja.status !== 'zatwierdzona';
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
    switch (status?.toLowerCase()) {
      case 'nowa':
        return 'info';
      case 'zatwierdzona':
        return 'success';
      case 'anulowana':
        return 'danger';
      default:
        return 'warn';
    }
  }

  getStatusLabel(status: string): string {
    return status || 'NOWA';
  }

  isUser(): boolean {
    return this.userRole === 'user';
  }

  isOwner(): boolean {
    return this.userRole === 'owner';
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }
}

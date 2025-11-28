import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUzytkownikDto } from '../models/uzytkownik.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}
  register(dto: CreateUzytkownikDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, dto);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<{ access_token: string }>(
      `${this.baseUrl}/login`,
      { username, password }
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

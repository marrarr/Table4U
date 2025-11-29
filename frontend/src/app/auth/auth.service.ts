import { Injectable, NgZone} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { CreateUzytkownikDto } from '../models/uzytkownik.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';

  private userRoleSubject = new BehaviorSubject<string | null>(null);
  ngZone = new NgZone({});
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {
    this.init();
  }

  init() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.userRoleSubject.next(decoded.role);
      } catch {
        this.userRoleSubject.next(null);
      }
    } else {
      this.userRoleSubject.next(null);
    }
  }

  register(dto: CreateUzytkownikDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, dto);
  }

 login(username: string, password: string): Observable<any> {
  return this.http.post<{ access_token: string }>(
    `${this.baseUrl}/login`,
    { username, password }
  ).pipe(
    map(res => {
      this.setToken(res.access_token);

      let role: string | null = null;
      try {
        const decoded: any = jwtDecode(res.access_token);
        role = decoded.role;
      } catch {
        role = null;
      }
      this.ngZone.run(() => {
        this.userRoleSubject.next(role);
      });
      return res; 
    })
  );
}



  logout() {
    localStorage.removeItem('token');
    this.userRoleSubject.next(null);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

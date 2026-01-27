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
        // Persist user id from token so other parts (e.g. reservation) can read it after reload
        // token payload may contain user id under different keys (backend uses `sub`)
        const uid = (decoded && (decoded.uzytkownik_id ?? decoded.sub)) as number | undefined;
        if (uid) {
          localStorage.setItem('uzytkownik_id', uid.toString());
        }
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
        // token payload may contain user id under different keys (backend uses `sub`)
        const uid = (decoded && (decoded.uzytkownik_id ?? decoded.sub)) as number | undefined;
        if (uid) {
          localStorage.setItem('uzytkownik_id', uid.toString());
        }
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
    localStorage.removeItem('uzytkownik_id');
    this.userRoleSubject.next(null);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  // Synchronous role extraction from token as a fallback when BehaviorSubject is null
  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      // Support different token shapes
      if (decoded.role) return decoded.role;
      if (decoded.roles) {
        if (Array.isArray(decoded.roles)) return decoded.roles[0];
        return decoded.roles as string;
      }
      return null;
    } catch {
      return null;
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  organizationId: string;
  role: string;
  twoFactorEnabled?: boolean;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  tempToken?: string;
  token?: string;
  user?: User;
  username?: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      this.loadCurrentUser().subscribe();
    }
  }

  register(username: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, {
      username,
      email,
      password
    });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user || null);
        }
      })
    );
  }

  verify2FA(tempToken: string, code: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/verify-2fa`, {
      tempToken,
      code
    }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user || null);
        }
      })
    );
  }

  setup2FA(): Observable<TwoFactorSetup> {
    return this.http.post<TwoFactorSetup>(`${this.apiUrl}/auth/setup-2fa`, {});
  }

  enable2FA(code: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/auth/enable-2fa`, { code });
  }

  disable2FA(code: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/auth/disable-2fa`, { code });
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}


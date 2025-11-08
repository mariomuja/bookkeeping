import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type AuthenticationMethod = 'credentials' | 'activeDirectory' | 'google' | 'microsoft' | 'github' | 'saml';

export interface AuthenticationProvider {
  method: AuthenticationMethod;
  name: string;
  icon: string;
  enabled: boolean;
  config?: any;
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  authMethod: AuthenticationMethod;
  roles: string[];
  organizationId?: string;
  lastLogin?: Date;
  createdAt: Date;
}

export interface AuthenticationConfig {
  apiUrl: string;
  providers: AuthenticationProvider[];
  enableUserManagement?: boolean;
}

export const AUTHENTICATION_CONFIG = 'AUTHENTICATION_CONFIG';

/**
 * Shared authentication service supporting multiple authentication methods
 * 
 * Supports:
 * - Traditional username/password
 * - Active Directory (LDAP/SAML)
 * - OAuth providers (Google, Microsoft, GitHub)
 * - SAML SSO
 * 
 * Usage:
 * ```typescript
 * constructor(private authService: SharedAuthenticationService) {
 *   this.authService.configure({
 *     apiUrl: '/api',
 *     providers: [
 *       { method: 'credentials', name: 'Email/Password', icon: '🔑', enabled: true },
 *       { method: 'google', name: 'Google', icon: 'G', enabled: true },
 *       { method: 'activeDirectory', name: 'Active Directory', icon: '🏢', enabled: true }
 *     ]
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class SharedAuthenticationService {
  private config?: AuthenticationConfig;

  constructor(
    private http: HttpClient,
    @Optional() @Inject(AUTHENTICATION_CONFIG) config?: AuthenticationConfig
  ) {
    this.config = config;
  }

  /**
   * Configure authentication service
   */
  configure(config: AuthenticationConfig): void {
    this.config = config;
  }

  /**
   * Get available authentication providers
   */
  getAvailableProviders(): AuthenticationProvider[] {
    return this.config?.providers.filter(p => p.enabled) || [];
  }

  /**
   * Authenticate with credentials (username/password)
   */
  loginWithCredentials(username: string, password: string): Observable<any> {
    return this.http.post(`${this.config?.apiUrl}/auth/login/credentials`, { username, password }).pipe(
      catchError(error => {
        console.error('[Auth] Credentials login failed:', error);
        throw error;
      })
    );
  }

  /**
   * Authenticate with Active Directory
   */
  loginWithActiveDirectory(username: string, password: string, domain?: string): Observable<any> {
    return this.http.post(`${this.config?.apiUrl}/auth/login/ad`, { username, password, domain }).pipe(
      catchError(error => {
        console.error('[Auth] Active Directory login failed:', error);
        throw error;
      })
    );
  }

  /**
   * Initiate OAuth login (Google, Microsoft, GitHub)
   */
  loginWithOAuth(provider: 'google' | 'microsoft' | 'github'): void {
    const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
    window.location.href = `${this.config?.apiUrl}/auth/oauth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  /**
   * Handle OAuth callback
   */
  handleOAuthCallback(provider: string, code: string): Observable<any> {
    return this.http.post(`${this.config?.apiUrl}/auth/oauth/${provider}/callback`, { code }).pipe(
      catchError(error => {
        console.error('[Auth] OAuth callback failed:', error);
        throw error;
      })
    );
  }

  /**
   * Authenticate with SAML SSO
   */
  loginWithSAML(): void {
    window.location.href = `${this.config?.apiUrl}/auth/saml/login`;
  }

  /**
   * Handle SAML callback
   */
  handleSAMLCallback(samlResponse: string): Observable<any> {
    return this.http.post(`${this.config?.apiUrl}/auth/saml/callback`, { samlResponse }).pipe(
      catchError(error => {
        console.error('[Auth] SAML callback failed:', error);
        throw error;
      })
    );
  }

  /**
   * Create new user (admin only)
   */
  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.config?.apiUrl}/admin/users`, userData).pipe(
      catchError(error => {
        console.error('[Auth] Create user failed:', error);
        throw error;
      })
    );
  }

  /**
   * Get all users (admin only)
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.config?.apiUrl}/admin/users`).pipe(
      catchError(error => {
        console.error('[Auth] Get users failed:', error);
        return of([]);
      })
    );
  }

  /**
   * Update user (admin only)
   */
  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.config?.apiUrl}/admin/users/${userId}`, userData).pipe(
      catchError(error => {
        console.error('[Auth] Update user failed:', error);
        throw error;
      })
    );
  }

  /**
   * Delete user (admin only)
   */
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.config?.apiUrl}/admin/users/${userId}`).pipe(
      catchError(error => {
        console.error('[Auth] Delete user failed:', error);
        throw error;
      })
    );
  }

  /**
   * Sync users from Active Directory (admin only)
   */
  syncActiveDirectoryUsers(): Observable<{ synced: number; users: User[] }> {
    return this.http.post<any>(`${this.config?.apiUrl}/admin/users/sync-ad`, {}).pipe(
      catchError(error => {
        console.error('[Auth] AD sync failed:', error);
        throw error;
      })
    );
  }
}



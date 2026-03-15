import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, TouristRegisterRequest } from '../models/auth.model';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment as env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<AuthResponse | null>(null);
  profileImage = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUser.set(user);
      if (user.profileImage) {
        this.profileImage.set(AuthService.getPhotoUrl(user.profileImage));
      }
    }
  }

  static getPhotoUrl(path: string | null | undefined): string {
    if (!path) return 'assets/placeholder-tour.jpg';
    if (path.startsWith('http')) return path;

    const base = env.baseUrl;
    const cleanPath = path.replace(/^\/+/, '');

    if (cleanPath.startsWith('uploads/')) {
      return (`${base}/${cleanPath}`).replace(/([^:])(\/\/+)/g, '$1/');
    }

    return (`${base}/uploads/${cleanPath}`).replace(/([^:])(\/\/+)/g, '$1/');
  }

  loadProfileImage(): void {
    this.http.get<any>(`${env.apiUrl}/users/profile`).subscribe({
      next: p => {
        if (p.profileImage) {
          const url = AuthService.getPhotoUrl(p.profileImage);
          this.profileImage.set(url);
          const user = this.currentUser();
          if (user && user.profileImage !== p.profileImage) {
            const updated = { ...user, profileImage: p.profileImage };
            localStorage.setItem('user', JSON.stringify(updated));
            this.currentUser.set(updated);
          }
        }
      }
    });
  }

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  registerTourist(data: TouristRegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/tourist`, data).pipe(
      tap(res => this.setSession(res))
    );
  }

  registerGuide(data: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/guide`, data).pipe(
      tap(res => this.setSession(res) as any)
    )
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.profileImage.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSession(authResult: AuthResponse) {
    if (authResult.token) {
      localStorage.setItem('token', authResult.token);
      localStorage.setItem('user', JSON.stringify(authResult));
      this.currentUser.set(authResult);
      if (authResult.profileImage) {
        this.profileImage.set(AuthService.getPhotoUrl(authResult.profileImage));
      }
      // Force refreshing from backend to ensure we have the latest and cleanest data
      this.loadProfileImage();
    }
  }

  private getUserFromStorage(): AuthResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

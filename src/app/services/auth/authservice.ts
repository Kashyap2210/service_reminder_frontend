import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ILoginResponse, IUserCreateDto, IUserEntity } from 'service_reminder_common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  currentUser = signal<any>(null);
  token = signal<string>('');
  private baseUrl = 'http://localhost:3000/api/v1';

  login(name: string, password: string) {
    return this.http.post<ILoginResponse>(`${this.baseUrl}/auth/login`, {
      name,
      password,
    });
  }

  signup(payload: IUserCreateDto) {
    console.log(`${this.baseUrl}/user`);
    return this.http.post(`${this.baseUrl}/user`, payload);
  }

  setSession(user?: IUserEntity, token?: string) {
    if (user) {
      this.currentUser.set(user);
      localStorage.setItem('user', JSON.stringify(user));
    }
    if (token) {
      this.token.set(token);
      localStorage.setItem('token', token);
    }
  }

  logout() {
    this.currentUser.set(null);
    this.token.set('');
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}

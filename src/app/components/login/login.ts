import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { ILoginResponse } from 'service_reminder_common';
import { AuthService } from '../../services/auth/authservice';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, GenericButtonComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService);

  name = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  onSubmit = () => {
    return this.authService.login(this.name(), this.password()).pipe(
      tap((res: ILoginResponse) => {
        this.authService.setSession(res.currentUser, res.accessToken);
        this.router.navigate(['/']);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || err.error?.[0]?.message || 'Login Failed');

        return throwError(() => err);
      }),
    );
  };
}

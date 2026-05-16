import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { ILoginDto, ILoginResponse } from 'service_reminder_common';
import { AuthService } from '../../services/auth/authservice';
import { LoginFormComponent } from './login-form.model';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    // GenericButtonComponent,
    // GenericInputComponent,
    LoginFormComponent,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = signal(false);
  error = signal('');

  onSubmit = (reqBody: ILoginDto) => {
    // this.form.markAllAsTouched();
    // if (this.form.invalid) return;

    console.log('reqBody', reqBody);

    this.error.set('');
    const { name, password } = reqBody;

    return this.authService.login(name, password).pipe(
      tap((res: ILoginResponse) => {
        this.authService.setSession(res.currentUser, res.accessToken);
        this.router.navigate(['/profile']);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || err.error?.[0]?.message || 'Login Failed');
        return throwError(() => err);
      }),
    );
  };
}

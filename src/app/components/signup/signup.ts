import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { IUserCreateDto, UserRole } from 'service_reminder_common';
import { AuthService } from '../../services/auth/authservice';
import { SignupFormComponent, SignupFormValue } from './signup-form.model';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, ReactiveFormsModule, SignupFormComponent],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  private router = inject(Router);
  private authService = inject(AuthService);

  // loading = signal(false);
  error = signal('');
  success = signal(false);

  onSubmit = (reqBody: SignupFormValue) => {
    // Mark all fields touched so errors show on first submit attempt
    // this.form.markAllAsTouched();
    // if (this.form.invalid) return;

    this.error.set('');

    const body: IUserCreateDto = {
      ...reqBody,
      role: UserRole.USER,
    };

    return this.authService.signup(body).pipe(
      tap(() => this.success.set(true)),
      catchError((err) => {
        this.error.set(err.error?.message || err.error?.[0]?.message || 'Signup failed');
        return throwError(() => err);
      }),
    );
  };

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}

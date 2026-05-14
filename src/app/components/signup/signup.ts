import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { IUserCreateDto, UserRole } from 'service_reminder_common';
import { AuthService } from '../../services/auth/authservice';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink, GenericButtonComponent],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  private router = inject(Router);
  private authService = inject(AuthService);

  name = signal('');
  email = signal('');
  password = signal('');
  contactNo = signal('');
  // role = signal('USER');
  loading = signal(false);
  error = signal('');
  success = signal(false);

  onSubmit = () => {
    this.error.set('');

    return this.authService.signup(this.userSignUpRequestBody).pipe(
      tap(() => {
        this.success.set(true);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || err.error?.[0]?.message || 'Signup failed');

        return throwError(() => err);
      }),
    );
  };
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  get userSignUpRequestBody(): IUserCreateDto {
    return {
      name: this.name(),
      email: this.email(),
      password: this.password(),
      contactNo: this.contactNo(),
      role: UserRole.USER,
    };
  }
}

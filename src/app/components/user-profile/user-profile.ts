import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/authservice';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css'],
  standalone: true,
})
export class UserProfile implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = signal<any>(null);

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
    } else {
      this.user.set(currentUser);
    }
  }

  logout() {
    this.authService.clearSession();
    // this.router.navigate(['/login']);
    this.router.navigate(['']);
  }
}

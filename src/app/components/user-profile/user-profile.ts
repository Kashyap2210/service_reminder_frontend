import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from '../../services/auth/authservice';
import { UserService } from '../../services/user/user.service';
import { DeleteButtonComponent } from '../../shared/buttons/delete-button/delete-button';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';
import { GenericModalComponent } from '../../shared/generic-modal/generic-modal';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css'],
  standalone: true,
  imports: [GenericButtonComponent, GenericModalComponent, DeleteButtonComponent],
})
export class UserProfile implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  user = signal<any>(null);
  modal = viewChild(GenericModalComponent);

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
    } else {
      this.user.set(currentUser);
    }
  }

  logout = () => {
    this.authService.clearSession();
    this.router.navigate(['']);
  };

  deleteAccount = () => {
    this.modal()?.open();
  };

  handleConfirmDelete = () => {
    const currentUser = this.user();
    if (!currentUser?.id) return;
    return this.userService.delete(currentUser.id).pipe(
      tap(() => {
        this.authService.clearSession();
        this.router.navigate(['/home']);
      }),
    );
  };
}

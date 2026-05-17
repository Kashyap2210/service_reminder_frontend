import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IUserEntity } from 'service_reminder_common';
import { AuthService } from '../../services/auth/authservice';
import { SelectOption } from '../../shared/generic-dropdown/generic-dropdown';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive, MatIcon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser: IUserEntity | null = null;

  profileForm!: FormGroup;
  profileOptions: SelectOption[] = [
    { label: 'Profile', value: 'profile' },
    { label: 'Logout', value: 'logout' },
  ];
  isProfileMenuOpen = false;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser()!;
    this.profileForm = this.fb.group({
      action: [''],
    });

    // this.profileForm.get('action')?.valueChanges.subscribe((value) => {
    //   if (value) {
    //     this.onProfileAction(value);
    //     this.profileForm.get('action')?.reset('', { emitEvent: false });
    //   }
    // });
  }

  onClickLogout() {
    this.authService.logout();
    this.router.navigate(['login']);
    this.isProfileMenuOpen = false;
  }

  onClickProfile() {
    this.router.navigate(['/profile']);
    this.isProfileMenuOpen = false;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  //   onProfileAction(action: string) {
  //     if (action === 'profile') {
  //       this.router.navigate(['/profile']);
  //     } else if (action === 'logout') {
  //       // TODO: Implement logout logic (call auth service)
  //       console.log('Logout action');
  //       this.authService.logout();
  //       this.router.navigate(['login']);
  //     }
  //   }
}

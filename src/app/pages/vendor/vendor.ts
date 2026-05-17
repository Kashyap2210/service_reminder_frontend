import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  IUserEntity,
  IVendorCreateDto,
  IVendorEntity,
  IVendorSearchDto,
} from 'service_reminder_common';
import { AuthService } from '../../services/auth/authservice';
import { VendorService } from '../../services/vendor/vendor.service';
import { CancelButtonComponent } from '../../shared/buttons/cancel-button/cancel-button';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';
import { VendorFormComponent } from './vendor-form/vendor-form';

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [VendorFormComponent, GenericButtonComponent, CancelButtonComponent, DatePipe],
  templateUrl: './vendor.html',
  styleUrls: ['./vendor.css'],
})
export class Vendor {
  private vendorService = inject(VendorService);
  private router = inject(Router);
  private authService = inject(AuthService);

  items = signal<IVendorEntity[]>([]);
  error = signal('');

  isFormOpen = false;
  currentUser: IUserEntity = {} as IUserEntity;
  editingItem: IVendorEntity | null = null;

  onClickOpenForm() {
    this.editingItem = null;
    this.isFormOpen = true;
  }

  onClickCloseForm = () => {
    this.isFormOpen = false;
    this.editingItem = null;
  };

  onClickEdit = (item: IVendorEntity) => {
    this.editingItem = item;
    this.isFormOpen = true;
    this.error.set('');
  };

  onClickDelete = (id: number) => {
    this.error.set('');
    this.vendorService.delete(id).subscribe({
      next: () => {
        this.items.update((items) => items.filter((i) => i.id !== id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to delete vendor.');
      },
    });
  };

  constructor() {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser()!;
    this.loadItems();
  }

  loadItems() {
    this.vendorService.search({} as IVendorSearchDto).subscribe({
      next: (items) => {
        this.items.set(items);
        this.error.set('');
      },
      error: (err) => {
        console.log('error', err);
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }

        this.error.set(err.error?.message || 'Unable to load vendors.');
      },
    });
  }

  onSubmit = (value: IVendorCreateDto) => {
    this.error.set('');

    const request$ = this.editingItem
      ? this.vendorService.update(this.editingItem.id, value)
      : this.vendorService.create({
          ...value,
          userId: this.currentUser.id,
        });

    this.isFormOpen = false;
    this.editingItem = null;

    return request$.pipe(
      tap((savedItem) => {
        this.items.update((items) => {
          const idx = items.findIndex((i) => i.id === savedItem.id);
          return idx !== -1
            ? items.map((i) => (i.id === savedItem.id ? savedItem : i)) // update existing
            : [savedItem, ...items]; // prepend new
        });
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Unable to save vendor.');
        return throwError(() => err);
      }),
    );
  };
}

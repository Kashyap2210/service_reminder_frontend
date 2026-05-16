import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  IRecurringItemCreateDto,
  IRecurringItemEntity,
  IRecurringItemSearchDto,
  IUserEntity,
  ServicePeriodUnit,
} from 'service_reminder_common';
import { AuthService } from '../../services/auth/authservice';
import { RecurringItemService } from '../../services/recurring-item/recurring-item.service';
import { CancelButtonComponent } from '../../shared/buttons/cancel-button/cancel-button';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';
import { RecurringItemFormComponent } from './recurring-item-form/recurring-item-form';

@Component({
  selector: 'app-recurring-item',
  standalone: true,
  imports: [RecurringItemFormComponent, GenericButtonComponent, CancelButtonComponent],
  templateUrl: './recurring-item.html',
  styleUrls: ['./recurring-item.css'],
})
export class RecurringItem {
  private recurringItemService = inject(RecurringItemService);
  private router = inject(Router);
  private authService = inject(AuthService);

  items = signal<IRecurringItemEntity[]>([]);
  error = signal('');

  isFormOpen = false;
  currentUser: IUserEntity = {} as IUserEntity;

  onClickOpenForm() {
    return (this.isFormOpen = true);
  }

  onClickCloseForm = () => {
    this.isFormOpen = false;
  };

  constructor() {
    // effect(() => this.loadItems());
  }

  ngOnInit() {
    this.loadItems();
    this.currentUser = this.authService.getCurrentUser()!;
  }

  loadItems() {
    this.recurringItemService.search({} as IRecurringItemSearchDto).subscribe({
      next: (items) => {
        this.items.set(items);
        this.error.set('');
      },
      error: (err) => {
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }

        this.error.set(err.error?.message || 'Unable to load recurring items.');
      },
    });
  }

  onSubmit = (value: IRecurringItemCreateDto) => {
    this.isFormOpen = false;
    this.error.set('');
    return this.recurringItemService
      .create({
        ...value,
        servicePeriodUnit: ServicePeriodUnit.MONTHS,
        userId: this.currentUser.id,
      })
      .pipe(
        tap(() => this.loadItems()),
        catchError((err) => {
          this.error.set(err.error?.message || 'Unable to save recurring item.');
          return throwError(() => err);
        }),
      );
  };
}

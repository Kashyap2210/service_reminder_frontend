import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  DateUtil,
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
  imports: [RecurringItemFormComponent, GenericButtonComponent, CancelButtonComponent, DatePipe],
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
  editingItem: IRecurringItemEntity | null = null;

  onClickOpenForm() {
    this.editingItem = null;
    this.isFormOpen = true;
  }

  onClickCloseForm = () => {
    this.isFormOpen = false;
    this.editingItem = null;
  };

  onClickEdit = (item: IRecurringItemEntity) => {
    this.editingItem = item;
    this.isFormOpen = true;
    this.error.set('');
  };

  onClickDelete = (id: number) => {
    this.error.set('');
    this.recurringItemService.delete(id).subscribe({
      next: () => {
        this.items.update((items) => items.filter((i) => i.id !== id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to delete recurring item.');
      },
    });
  };

  constructor() {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser()!;
    // console.log('this.currentUser', this.currentUser);
    this.loadItems();
  }

  loadItems() {
    this.recurringItemService.search({} as IRecurringItemSearchDto).subscribe({
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

        this.error.set(err.error?.message || 'Unable to load recurring items.');
      },
    });
  }

  onSubmit = (value: IRecurringItemCreateDto) => {
    this.error.set('');

    const request$ = this.editingItem
      ? this.recurringItemService.update(this.editingItem.id, value)
      : this.recurringItemService.create({
          ...value,
          servicePeriodUnit: ServicePeriodUnit.MONTHS,
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
        this.error.set(err.error?.message || 'Unable to save recurring item.');
        return throwError(() => err);
      }),
    );
  };

  readableDateFromEpoch(epochDate: number) {
    console.log(DateUtil.toReadable(epochDate));
    return DateUtil.toReadable(epochDate);
  }
}

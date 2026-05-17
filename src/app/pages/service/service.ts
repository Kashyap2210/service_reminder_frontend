import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  DateCodeUtils,
  IServiceCreateDto,
  IServiceEntity,
  IServiceSearchDto,
  IUserEntity,
  ServiceAction,
} from 'service_reminder_common';
import { AuthService } from '../../services/auth/authservice';
import { ServiceApiService } from '../../services/service/service.service';
import { CancelButtonComponent } from '../../shared/buttons/cancel-button/cancel-button';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';
import { ServiceFormComponent } from './service-form/service-form';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [ServiceFormComponent, GenericButtonComponent, CancelButtonComponent, CurrencyPipe],
  templateUrl: './service.html',
  styleUrls: ['./service.css'],
})
export class Service {
  private serviceService = inject(ServiceApiService);
  private router = inject(Router);
  private authService = inject(AuthService);

  items = signal<(IServiceEntity & { formattedServiceDate: string })[]>([]);
  error = signal('');

  isFormOpen = false;
  currentUser: IUserEntity = {} as IUserEntity;
  editingItem: IServiceEntity | null = null;

  onClickOpenForm() {
    this.editingItem = null;
    this.isFormOpen = true;
  }

  onClickCloseForm = () => {
    this.isFormOpen = false;
    this.editingItem = null;
  };

  onClickEdit = (item: IServiceEntity) => {
    this.editingItem = item;
    this.isFormOpen = true;
    this.error.set('');
  };

  onClickDelete = (id: number) => {
    this.error.set('');
    this.serviceService.delete(id).subscribe({
      next: () => {
        this.items.update((items) => items.filter((i) => i.id !== id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to delete service.');
      },
    });
  };

  constructor() {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser()!;
    this.loadItems();
  }

  loadItems() {
    this.serviceService.search({} as IServiceSearchDto).subscribe({
      next: (items) => {
        this.items.set(this.getServiceEntitiesWithFormattedDate(items));
        this.error.set('');
      },
      error: (err) => {
        console.log('error', err);
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }

        this.error.set(err.error?.message || 'Unable to load services.');
      },
    });
  }

  onSubmit = (value: IServiceCreateDto) => {
    this.error.set('');

    const request$ = this.editingItem
      ? this.serviceService.update(this.editingItem.id, { ...value, action: ServiceAction.EDIT })
      : this.serviceService.create({
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
            ? this.getServiceEntitiesWithFormattedDate(
                items.map((i) => (i.id === savedItem.id ? savedItem : i)),
              ) // update existing
            : this.getServiceEntitiesWithFormattedDate([savedItem, ...items]); // prepend new
        });
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Unable to save service.');
        return throwError(() => err);
      }),
    );
  };

  getFormatted(date: string | number) {
    return new DateCodeUtils(date).toLongDateString();
  }

  getServiceEntitiesWithFormattedDate(serviceEntites: IServiceEntity[]) {
    return serviceEntites.map((entity) => ({
      ...entity,
      formattedServiceDate: this.getFormatted(entity.serviceDate),
    }));
  }
}

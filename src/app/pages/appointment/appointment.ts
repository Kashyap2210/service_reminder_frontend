import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  AppointmentAction,
  DateCodeUtils,
  IAppointmentCreateDto,
  IAppointmentEntity,
  IAppointmentSearchDto,
  IAppointmentUpdateDto,
  IUserEntity,
} from 'service_reminder_common';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { AuthService } from '../../services/auth/authservice';
import { CancelButtonComponent } from '../../shared/buttons/cancel-button/cancel-button';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';
import { AppointmentFormComponent } from './appointment-form/appointment-form';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [AppointmentFormComponent, GenericButtonComponent, CancelButtonComponent, DatePipe],
  templateUrl: './appointment.html',
  styleUrls: ['./appointment.css'],
})
export class Appointment {
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);
  private authService = inject(AuthService);

  items = signal<IAppointmentEntity[]>([]);
  error = signal('');

  isFormOpen = false;
  currentUser: IUserEntity = {} as IUserEntity;
  editingItem: IAppointmentEntity | null = null;

  onClickOpenForm() {
    this.editingItem = null;
    this.isFormOpen = true;
  }

  onClickCloseForm = () => {
    this.isFormOpen = false;
    this.editingItem = null;
  };

  onClickEdit = (item: IAppointmentEntity) => {
    this.editingItem = item;
    console.log('this.editingItem', this.editingItem);
    this.isFormOpen = true;
    this.error.set('');
  };

  onClickDelete = (id: number) => {
    this.error.set('');
    this.appointmentService.delete(id).subscribe({
      next: () => {
        this.items.update((items) => items.filter((i) => i.id !== id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to delete appointment.');
      },
    });
  };

  constructor() {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser()!;
    this.loadItems();
  }

  loadItems() {
    this.appointmentService.search({} as IAppointmentSearchDto).subscribe({
      next: (items) => {
        this.items.set(items);
        this.error.set('');
      },
      error: (err) => {
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }

        this.error.set(err.error?.message || 'Unable to load appointments.');
      },
    });
  }

  onSubmit = (value: IAppointmentCreateDto) => {
    this.error.set('');

    const request$ = this.editingItem
      ? this.appointmentService.update(this.editingItem.id, {
          ...value,
          action: AppointmentAction.EDIT,
        } as IAppointmentUpdateDto)
      : this.appointmentService.create({
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
            ? items.map((i) => (i.id === savedItem.id ? savedItem : i))
            : [savedItem, ...items];
        });
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Unable to save appointment.');
        return throwError(() => err);
      }),
    );
  };

  getAppointmentDateFormatted(date: string | number) {
    return new DateCodeUtils(date).toLongDateString();
  }
}

import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  AppointmentAction,
  AppointmentModel,
  DateCodeUtils,
  EntityFilterDataHelper,
  EntityList,
  IAppointmentCreateDto,
  IAppointmentUpdateDto,
  IEntityFilterSearchData,
  IEntityFilterSearchDataV2,
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

  items = signal<AppointmentModel[]>([]);
  error = signal('');

  isFormOpen = false;
  currentUser: IUserEntity = {} as IUserEntity;
  editingItem: AppointmentModel | null = null;
  filterDataHelper: EntityFilterDataHelper = {} as EntityFilterDataHelper;

  onClickOpenForm() {
    this.editingItem = null;
    this.isFormOpen = true;
  }

  onClickCloseForm = () => {
    this.isFormOpen = false;
    this.editingItem = null;
  };

  onClickEdit = (item: AppointmentModel) => {
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
    const vendorRelationConfig: IEntityFilterSearchData<EntityList.VENDOR> = {
      name: EntityList.VENDOR,
    };

    const userRelationConfig: IEntityFilterSearchData<EntityList.USER> = {
      name: EntityList.USER,
    };

    const recurringItemRelationConfig: IEntityFilterSearchData<EntityList.RECURRING_ITEM> = {
      name: EntityList.RECURRING_ITEM,
    };

    const filter: IEntityFilterSearchDataV2<EntityList.APPOINTMENT> = {
      name: EntityList.APPOINTMENT,
      filter: {
        include: {
          userId: [this.currentUser.id],
        },
        relations: [userRelationConfig, vendorRelationConfig, recurringItemRelationConfig],
      },
    };

    this.appointmentService.baseSearch(filter).subscribe({
      next: (searchResponse) => {
        const filterDataHelper = new EntityFilterDataHelper(searchResponse);
        filterDataHelper.populateRelationsFor([EntityList.APPOINTMENT]);

        this.filterDataHelper = filterDataHelper;

        this.items.set(filterDataHelper.entityModelsMap[EntityList.APPOINTMENT]);
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
        const savedModel = this.filterDataHelper
          ? this.filterDataHelper.mergeEntity(EntityList.APPOINTMENT, savedItem)
          : AppointmentModel.populateFromEntity(savedItem);

        this.items.update((items) => {
          const idx = items.findIndex((i) => i.id === savedItem.id);
          return idx !== -1
            ? items.map((i) => (i.id === savedItem.id ? savedModel : i))
            : [savedModel, ...items];
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

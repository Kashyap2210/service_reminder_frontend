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
  AppointmentAction as _AppointmentAction,
  appointmentFlowConfig,
} from 'service_reminder_common';
import { DropdownMenuComponent, DropdownMenuItem } from '../../components/dropdown/dropdown';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { AuthService } from '../../services/auth/authservice';
import { CancelButtonComponent } from '../../shared/buttons/cancel-button/cancel-button';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';
import { AppointmentFormComponent } from './appointment-form/appointment-form';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    AppointmentFormComponent,
    GenericButtonComponent,
    CancelButtonComponent,
    DatePipe,
    DropdownMenuComponent,
  ],
  templateUrl: './appointment.html',
  styleUrls: ['./appointment.css'],
})
export class Appointment {
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);
  private authService = inject(AuthService);
  // expose enum for template usage
  readonly AppointmentAction = _AppointmentAction;

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

  constructor() {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser()!;
    this.loadItems();
  }

  loadItems() {
    const vendorRelationConfig: IEntityFilterSearchData<EntityList.VENDOR> = {
      name: EntityList.VENDOR,
    };

    const vendorRecurringItemRelationConfig: IEntityFilterSearchData<EntityList.VENDOR_RECURRING_ITEM_MAPPING> =
      {
        name: EntityList.VENDOR_RECURRING_ITEM_MAPPING,
      };

    const userRelationConfig: IEntityFilterSearchData<EntityList.USER> = {
      name: EntityList.USER,
    };

    const recurringItemRelationConfig: IEntityFilterSearchData<EntityList.RECURRING_ITEM> = {
      name: EntityList.RECURRING_ITEM,
      relations: [vendorRecurringItemRelationConfig],
    };

    const filter: IEntityFilterSearchDataV2<EntityList.APPOINTMENT> = {
      name: EntityList.APPOINTMENT,
      filter: {
        include: {
          userId: [this.currentUser.id],
        },
        relations: [userRelationConfig],
        entities: [vendorRelationConfig, recurringItemRelationConfig],
      },
    };

    this.appointmentService.baseSearch(filter).subscribe({
      next: (searchResponse) => {
        const filterDataHelper = new EntityFilterDataHelper(searchResponse);
        filterDataHelper.populateRelationsFor([
          EntityList.APPOINTMENT,
          EntityList.VENDOR,
          EntityList.RECURRING_ITEM,
          EntityList.VENDOR_RECURRING_ITEM_MAPPING,
        ]);

        this.filterDataHelper = filterDataHelper;
        // console.log('this.filterDataHelper', this.filterDataHelper);

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

  private saveAppointment(id: number | null, dto: IAppointmentCreateDto | IAppointmentUpdateDto) {
    const request$ = id
      ? this.appointmentService.update(id, dto as IAppointmentUpdateDto)
      : this.appointmentService.create(dto as IAppointmentCreateDto);

    return request$.pipe(
      tap((savedItem) => {
        // console.log('savedItem', savedItem);
        const savedModel = this.filterDataHelper.mergeEntity(EntityList.APPOINTMENT, savedItem);
        // console.log('savedModel', savedModel);

        this.items.update((items) => {
          const exists = items.some((item) => item.id === savedModel.id);
          return exists
            ? items.map((item) => (item.id === savedModel.id ? savedModel : item)) // update
            : [...items, savedModel]; // create
        });
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Unable to save appointment.');
        return throwError(() => err);
      }),
    );
  }

  // Called by the form — returns observable for the form to subscribe to
  onSubmit = (value: IAppointmentCreateDto) => {
    this.error.set('');

    const dateChanged =
      this.editingItem &&
      String(value.appointmentDate) !== String(this.editingItem.appointmentDate);

    const action = dateChanged ? AppointmentAction.RE_SCHEDULE : AppointmentAction.EDIT;

    const dto = this.editingItem
      ? ({ ...value, action } as IAppointmentUpdateDto)
      : ({ ...value, userId: this.currentUser.id } as IAppointmentCreateDto);

    this.isFormOpen = false;
    const editingId = this.editingItem?.id;
    this.editingItem = null;

    return this.saveAppointment(editingId!, dto);
  };

  // Called by action menu — subscribes itself, no form involved
  onClickActionUpdate = (item: AppointmentModel, action: AppointmentAction) => {
    this.error.set('');
    this.saveAppointment(item.id, { action } as IAppointmentUpdateDto).subscribe();
  };

  getAvailableActions(item: AppointmentModel): AppointmentAction[] {
    const status = item.appointmentStatus;
    const config = appointmentFlowConfig[status];

    if (!config) return [];
    // console.log('Object.keys(config.actions)', Object.keys(config.actions));
    return Object.keys(config.actions) as AppointmentAction[];
  }

  private actionHandlers: Partial<Record<AppointmentAction, (item: AppointmentModel) => void>> = {
    [AppointmentAction.EDIT]: (item) => this.onClickEdit(item),
    [AppointmentAction.RE_SCHEDULE]: (item) => this.onClickEdit(item), // same form, date change decides action
    [AppointmentAction.CANCEL]: (item) => this.onClickActionUpdate(item, AppointmentAction.CANCEL),
    [AppointmentAction.COMPLETE]: (item) =>
      this.onClickActionUpdate(item, AppointmentAction.COMPLETE),
    [AppointmentAction.MARK_NO_SHOW]: (item) =>
      this.onClickActionUpdate(item, AppointmentAction.MARK_NO_SHOW),
  };

  getActionMenuItems(item: AppointmentModel): DropdownMenuItem[] {
    return this.getAvailableActions(item).map((act) => ({
      label: act.replace(/_/g, ' '), // RE_SCHEDULE → RE SCHEDULE, or use a pipe
      value: act,
      danger: act === AppointmentAction.CANCEL,
    }));
  }

  onActionMenuSelect(appointment: AppointmentModel, menuItem: DropdownMenuItem) {
    const action = menuItem.value as AppointmentAction;
    const handler = this.actionHandlers[action];
    if (handler) {
      handler(appointment);
    } else {
      console.warn(`No handler registered for action: ${action}`);
    }
  }

  onClickEdit = (item: AppointmentModel) => {
    this.editingItem = item;
    // console.log('this.editingItem', this.editingItem);
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

  getAppointmentDateFormatted(date: string | number) {
    return new DateCodeUtils(date).toLongDateString();
  }
}

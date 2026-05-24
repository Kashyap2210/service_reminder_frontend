import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  AppointmentStatus,
  DateCodeUtils,
  EntityFilterDataHelper,
  EntityList,
  IEntityFilterSearchData,
  IEntityFilterSearchDataV2,
  IServiceCreateDto,
  IServiceUpdateDto,
  IUserEntity,
  Nullable,
  ServiceModel,
  ServiceAction as _ServiceAction,
  serviceFlowConfig,
} from 'service_reminder_common';
import { DropdownMenuComponent, DropdownMenuItem } from '../../components/dropdown/dropdown';
import { AuthService } from '../../services/auth/authservice';
import { ServiceApiService } from '../../services/service/service.service';
import { CancelButtonComponent } from '../../shared/buttons/cancel-button/cancel-button';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';
import { ServiceFormComponent } from './service-form/service-form';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [
    ServiceFormComponent,
    GenericButtonComponent,
    CancelButtonComponent,
    DropdownMenuComponent,
    CurrencyPipe,
  ],
  templateUrl: './service.html',
  styleUrls: ['./service.css'],
})
export class Service {
  private serviceService = inject(ServiceApiService);
  private router = inject(Router);
  private authService = inject(AuthService);

  items = signal<ServiceModel[]>([]);
  error = signal('');

  isFormOpen = false;
  readonly ServiceAction = _ServiceAction;

  currentUser: IUserEntity = {} as IUserEntity;
  editingItem: ServiceModel | null = null;
  filterDataHelper: EntityFilterDataHelper = {} as EntityFilterDataHelper;

  onClickOpenForm() {
    this.editingItem = null;
    this.isFormOpen = true;
  }

  onClickCloseForm = () => {
    this.isFormOpen = false;
    this.editingItem = null;
  };

  onClickEdit = (item: ServiceModel) => {
    this.editingItem = item;
    this.isFormOpen = true;
    this.error.set('');
  };

  private saveService(id: number | null, dto: IServiceCreateDto | IServiceUpdateDto) {
    const request$ = id
      ? this.serviceService.update(id, dto as IServiceUpdateDto)
      : this.serviceService.create(dto as IServiceCreateDto);

    return request$.pipe(
      tap((savedItem) => {
        const savedModel = this.filterDataHelper
          ? this.filterDataHelper.mergeEntity(EntityList.SERVICE, savedItem)
          : ServiceModel.populateFromEntity(savedItem);

        this.items.update((items) => {
          const idx = items.findIndex((i) => i.id === savedItem.id);
          return idx !== -1
            ? items.map((i) => (i.id === savedItem.id ? savedModel : i))
            : [savedModel, ...items];
        });
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Unable to save service.');
        return throwError(() => err);
      }),
    );
  }

  // Called by the form — returns observable for the form to subscribe to
  onSubmit = (value: IServiceCreateDto) => {
    this.error.set('');
    const editingId = this.editingItem?.id ?? null;

    const dto = this.editingItem
      ? ({ ...value, action: _ServiceAction.EDIT } as IServiceUpdateDto)
      : ({ ...value, userId: this.currentUser.id } as IServiceCreateDto);

    this.isFormOpen = false;
    this.editingItem = null;

    return this.saveService(editingId, dto);
  };

  // Called by action menu — subscribes itself, no form involved
  onClickActionUpdate = (item: ServiceModel, action: _ServiceAction) => {
    this.error.set('');
    this.saveService(item.id, { action } as IServiceUpdateDto).subscribe();
  };

  getAvailableActions(item: ServiceModel): _ServiceAction[] {
    const config = serviceFlowConfig[item.serviceStatus];

    if (!config) return [];
    return Object.keys(config.actions) as _ServiceAction[];
  }

  private actionHandlers: Partial<Record<_ServiceAction, (item: ServiceModel) => void>> = {
    [_ServiceAction.EDIT]: (item) => this.onClickEdit(item),
    [_ServiceAction.START]: (item) => this.onClickActionUpdate(item, _ServiceAction.START),
    [_ServiceAction.COMPLETE]: (item) => this.onClickActionUpdate(item, _ServiceAction.COMPLETE),
    [_ServiceAction.CANCEL]: (item) => this.onClickActionUpdate(item, _ServiceAction.CANCEL),
    [_ServiceAction.FAIL]: (item) => this.onClickActionUpdate(item, _ServiceAction.FAIL),
  };

  getActionMenuItems(item: ServiceModel): DropdownMenuItem[] {
    return this.getAvailableActions(item).map((act) => ({
      label: act.replace(/_/g, ' '),
      value: act,
      danger: act === _ServiceAction.CANCEL || act === _ServiceAction.FAIL,
    }));
  }

  onActionMenuSelect = (service: ServiceModel, menuItem: DropdownMenuItem) => {
    const action = menuItem.value as _ServiceAction;
    const handler = this.actionHandlers[action];
    if (handler) {
      handler(service);
    } else {
      console.warn(`No handler registered for action: ${action}`);
    }
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
    const vendorRelationConfig: IEntityFilterSearchData<EntityList.VENDOR> = {
      name: EntityList.VENDOR,
    };

    const vendorRecurringItemMappingRelationConfig: IEntityFilterSearchData<EntityList.VENDOR_RECURRING_ITEM_MAPPING> =
      {
        name: EntityList.VENDOR_RECURRING_ITEM_MAPPING,
        relations: [vendorRelationConfig],
      };

    const appointmentRelationConfig: IEntityFilterSearchData<EntityList.APPOINTMENT> = {
      name: EntityList.APPOINTMENT,
      include: {
        appointmentStatus: [AppointmentStatus.BOOKED, AppointmentStatus.RE_SCHEDULED],
      },
    };

    const recurringItemEntityConfig: IEntityFilterSearchData<EntityList.RECURRING_ITEM> = {
      name: EntityList.RECURRING_ITEM,
      relations: [vendorRecurringItemMappingRelationConfig, appointmentRelationConfig],
    };

    const userRelationConfig: IEntityFilterSearchData<EntityList.USER> = {
      name: EntityList.USER,
    };

    const filter: IEntityFilterSearchDataV2<EntityList.SERVICE> = {
      name: EntityList.SERVICE,
      filter: {
        include: {
          userId: [this.currentUser.id],
        },
        relations: [userRelationConfig],
        entities: [recurringItemEntityConfig],
      },
    };

    this.serviceService.baseSearch(filter).subscribe({
      next: (searchResponse) => {
        const filterDataHelper = new EntityFilterDataHelper(searchResponse);
        filterDataHelper.populateRelationsFor([
          EntityList.SERVICE,
          EntityList.USER,
          EntityList.VENDOR_RECURRING_ITEM_MAPPING,
          EntityList.VENDOR,
          EntityList.RECURRING_ITEM,
          EntityList.APPOINTMENT,
        ]);

        this.filterDataHelper = filterDataHelper;
        console.log('this.filterDataHelper', this.filterDataHelper);

        this.items.set(filterDataHelper.entityModelsMap[EntityList.SERVICE]);
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

  getFormatted(date: Nullable<number>) {
    if (!date) return null;
    return new DateCodeUtils(date).toLongDateString();
  }
}

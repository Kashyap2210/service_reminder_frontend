import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  DateCodeUtils,
  EntityFilterDataHelper,
  EntityList,
  IEntityFilterSearchData,
  IEntityFilterSearchDataV2,
  IServiceCreateDto,
  IUserEntity,
  Nullable,
  ServiceAction,
  ServiceModel,
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

  items = signal<ServiceModel[]>([]);
  error = signal('');

  isFormOpen = false;
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
    const recurringItemRelationConfig: IEntityFilterSearchData<EntityList.RECURRING_ITEM> = {
      name: EntityList.RECURRING_ITEM,
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
        relations: [userRelationConfig, vendorRelationConfig, recurringItemRelationConfig],
      },
    };

    this.serviceService.baseSearch(filter).subscribe({
      next: (searchResponse) => {
        const filterDataHelper = new EntityFilterDataHelper(searchResponse);
        filterDataHelper.populateRelationsFor([
          EntityList.SERVICE,
          EntityList.USER,
          EntityList.APPOINTMENT,
        ]);

        this.filterDataHelper = filterDataHelper;

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
  };

  getFormatted(date: Nullable<number>) {
    if (!date) return null;
    return new DateCodeUtils(date).toLongDateString();
  }
}

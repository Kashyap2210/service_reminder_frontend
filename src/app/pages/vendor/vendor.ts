import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  EntityFilterDataHelper,
  EntityList,
  IEntityFilterSearchData,
  IEntityFilterSearchDataV2,
  IUserEntity,
  IVendorCreateDto,
  IVendorUpdateDto,
  VendorModel,
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

  items = signal<VendorModel[]>([]);
  error = signal('');

  isFormOpen = false;
  currentUser: IUserEntity = {} as IUserEntity;
  editingItem: VendorModel | null = null;
  filterDataHelper: EntityFilterDataHelper = {} as EntityFilterDataHelper;

  onClickOpenForm() {
    this.editingItem = null;
    this.isFormOpen = true;
  }

  onClickCloseForm = () => {
    this.isFormOpen = false;
    this.editingItem = null;
  };

  onClickEdit = (item: VendorModel) => {
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
    const recurringItemEntityConfig: IEntityFilterSearchData<EntityList.RECURRING_ITEM> = {
      name: EntityList.RECURRING_ITEM,
      include: {
        userId: [this.currentUser.id],
      },
    };

    const vendorRecurringItemEntityConfig: IEntityFilterSearchData<EntityList.VENDOR_RECURRING_ITEM_MAPPING> =
      {
        name: EntityList.VENDOR_RECURRING_ITEM_MAPPING,
      };

    const filterData: IEntityFilterSearchDataV2<EntityList.VENDOR> = {
      name: EntityList.VENDOR,

      filter: {
        include: { userId: [this.currentUser.id] },
        relations: [vendorRecurringItemEntityConfig],
        entities: [recurringItemEntityConfig],
      },
    };

    this.vendorService.baseSearch(filterData).subscribe({
      next: (searchResponse) => {
        const filterDataHelper = new EntityFilterDataHelper(searchResponse);
        filterDataHelper.populateRelationsFor([
          EntityList.VENDOR,
          EntityList.RECURRING_ITEM,
          EntityList.VENDOR_RECURRING_ITEM_MAPPING,
        ]);

        this.filterDataHelper = filterDataHelper;
        this.items.set(filterDataHelper.entityModelsMap[EntityList.VENDOR]);
        this.error.set('');
      },
      error: (err) => {
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }
        this.error.set(err.error?.message || 'Unable to load vendors.');
      },
    });
  }

  private saveVendor(id: number | null, dto: IVendorCreateDto | IVendorUpdateDto) {
    const request$ = id
      ? this.vendorService.update(id, dto as IVendorUpdateDto)
      : this.vendorService.create(dto as IVendorCreateDto);

    return request$.pipe(
      tap((savedItem) => {
        const savedModel = this.filterDataHelper.mergeEntity(EntityList.VENDOR, savedItem);

        this.items.update((items) => {
          const exists = items.some((item) => item.id === savedModel.id);
          return exists
            ? items.map((item) => (item.id === savedModel.id ? savedModel : item))
            : [...items, savedModel];
        });
        this.loadItems();
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Unable to save vendor.');
        return throwError(() => err);
      }),
    );
  }

  // Called by the form — returns observable for the form to subscribe to
  onSubmit = (value: IVendorCreateDto) => {
    this.error.set('');

    const dto = this.editingItem
      ? ({ ...value } as IVendorUpdateDto)
      : ({ ...value, userId: this.currentUser.id } as IVendorCreateDto);

    this.isFormOpen = false;
    const editingId = this.editingItem?.id ?? null;
    this.editingItem = null;

    return this.saveVendor(editingId, dto);
  };
}

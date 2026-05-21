import { Component, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  definedValues,
  EntityFilterDataHelper,
  EntityList,
  IVendorCreateDto,
  Nullable,
  VendorModel,
} from 'service_reminder_common';
import { GenericButtonComponent } from '../../../shared/generic-button/generic-button';
import { GenericInputComponent } from '../../../shared/generic-input/generic-input';
import {
  GenericMultiSelectComponent,
  SelectOption,
} from '../../../shared/generic-multi-select/generic-multi-select';

type VendorFormValue = IVendorCreateDto;

@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericInputComponent,
    GenericButtonComponent,
    GenericMultiSelectComponent,
  ],
  templateUrl: './vendor-form.html',
  styleUrls: ['./vendor-form.css'],
})
export class VendorFormComponent implements OnInit {
  entityFilterDataHelper = input.required<EntityFilterDataHelper>();
  submitHandler = input.required<(value: IVendorCreateDto) => Observable<any>>();
  initialValue = input<Nullable<VendorModel>>(null);

  recurringItemOptions: SelectOption<number>[] = [];

  ngOnInit() {
    const recurringItems = this.entityFilterDataHelper().getEntityFromList(
      EntityList.RECURRING_ITEM,
    );
    this.recurringItemOptions = recurringItems.map((i) => ({ label: i.name, value: i.id }));

    const val = this.initialValue();
    if (val) {
      // Get preselected recurring item IDs using the vendorModel's relation mapping
      const vendorModel = val;

      console.log('vendorModel', vendorModel);

      const preselectedIds = definedValues(
        (vendorModel[EntityList.VENDOR_RECURRING_ITEM_MAPPING] || []).map(
          (mapping) => mapping[EntityList.RECURRING_ITEM]?.id,
        ),
      );

      this.form.patchValue({
        name: val.name,
        contactNo: val.contactNo,
        email: val.email ?? '',
        address: val.address,
        recurringItemIds: preselectedIds,
      });
    }
  }

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    contactNo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    recurringItemIds: new FormControl([] as number[], {
      nonNullable: true,
    }),
  });

  onClickSubmit = (): Observable<any> | void => {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    return this.submitHandler()(this.form.getRawValue() as VendorFormValue);
  };
}

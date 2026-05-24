import { Component, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  AppointmentType,
  DateCodeUtils,
  EntityFilterDataHelper,
  EntityList,
  IServiceCreateDto,
  IServiceEntity,
} from 'service_reminder_common';
import { GenericButtonComponent } from '../../../shared/generic-button/generic-button';
import {
  GenericSelectComponent,
  SelectOption,
} from '../../../shared/generic-dropdown/generic-dropdown';
import { GenericInputComponent } from '../../../shared/generic-input/generic-input';

type ServiceFormValue = IServiceCreateDto;

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericInputComponent,
    GenericButtonComponent,
    GenericSelectComponent,
  ],
  templateUrl: './service-form.html',
  styleUrls: ['./service-form.css'],
})
export class ServiceFormComponent implements OnInit {
  entityFilterDataHelper = input.required<EntityFilterDataHelper>();
  submitHandler = input.required<(value: ServiceFormValue) => Observable<any>>();
  initialValue = input<IServiceEntity | null>(null);

  vendorOptions: SelectOption<number>[] = [];
  recurringItemOptions: SelectOption<number>[] = [];

  ngOnInit() {
    const items = this.entityFilterDataHelper().getEntityFromList(EntityList.RECURRING_ITEM);
    const vendors = this.entityFilterDataHelper().getEntityFromList(EntityList.VENDOR);

    this.vendorOptions = vendors.map((v) => ({ label: v.name, value: v.id }));
    this.recurringItemOptions = items.map((i) => ({ label: i.name, value: i.id }));

    const val = this.initialValue();
    if (val) {
      const serviceDateStr = val.serviceDate
        ? `${String(val.serviceDate).substring(0, 4)}-${String(val.serviceDate).substring(4, 6)}-${String(val.serviceDate).substring(6, 8)}`
        : '';

      this.form.patchValue({
        serviceDate: serviceDateStr,
        recurringItemId: val.recurringItemId,
        serviceType: val.serviceType ?? '',
        vendorId: val.vendorId,
        appointmentId: val.appointmentId ?? null,
        serviceEstimate: val.serviceEstimate ?? null,
        serviceAmount: val.serviceAmount ?? null,
        invoiceDocument: val.invoiceDocument ?? null,
      });
    }
  }

  get vendorOptionsFromRecurringItem() {
    const recurringItemId = this.form.get('recurringItemId')?.value;
    const recurringItem = this.entityFilterDataHelper().entityModelsMap[
      EntityList.RECURRING_ITEM
    ].find((item) => item.id === recurringItemId);

    return (
      recurringItem?.vendors
        ?.filter((v) => v !== undefined)
        .map((v) => ({
          label: v.name,
          value: v.id,
        })) ?? []
    );
  }

  get appointmentOptionsFromRecurringItem() {
    const recurringItemId = this.form.get('recurringItemId')?.value;
    const serviceType = this.form.get('serviceType')?.value;
    const recurringItem = this.entityFilterDataHelper().entityModelsMap[
      EntityList.RECURRING_ITEM
    ].find((item) => item.id === recurringItemId);

    if (!recurringItem || !serviceType) return [];

    return (
      recurringItem.appointment
        ?.filter((a) => a.appointmentType === serviceType)
        .map((a) => ({
          label: `${a.id} - ${new DateCodeUtils(a.appointmentDate).toLongDateString()}`,
          value: a.id,
        })) ?? []
    );
  }

  form = new FormGroup({
    serviceDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    recurringItemId: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    serviceType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vendorId: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    appointmentId: new FormControl<number | null>(null, {
      nonNullable: false,
    }),
    serviceEstimate: new FormControl<number | null>(null, {
      nonNullable: false,
    }),
    serviceAmount: new FormControl<number | null>(null, {
      nonNullable: false,
    }),
    invoiceDocument: new FormControl<string | null>(null, {
      nonNullable: false,
    }),
  });

  serviceTypeOptions = Object.values(AppointmentType).map((v) => ({
    label: v,
    value: v,
  }));

  onClickSubmit = (): Observable<any> | void => {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const rawValue = this.form.getRawValue() as any;

    const serviceDateNum = rawValue.serviceDate
      ? Number(rawValue.serviceDate.replace(/-/g, ''))
      : 0;

    const value: ServiceFormValue = {
      ...rawValue,
      serviceDate: serviceDateNum,
      serviceEstimate: rawValue.serviceEstimate != null ? Number(rawValue.serviceEstimate) : null,
      serviceAmount: rawValue.serviceAmount != null ? Number(rawValue.serviceAmount) : null,
    };

    return this.submitHandler()(value);
  };
}

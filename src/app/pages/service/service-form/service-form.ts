import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppointmentType, IServiceCreateDto, IServiceEntity } from 'service_reminder_common';
import { GenericButtonComponent } from '../../../shared/generic-button/generic-button';
import { GenericSelectComponent } from '../../../shared/generic-dropdown/generic-dropdown';
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
export class ServiceFormComponent {
  submitHandler = input.required<(value: ServiceFormValue) => Observable<any>>();
  initialValue = input<IServiceEntity | null>(null);

  ngOnInit() {
    const val = this.initialValue();
    if (val) {
      // Convert YYYYMMDD number to YYYY-MM-DD string for date input
      const serviceDateStr = val.serviceDate
        ? `${String(val.serviceDate).substring(0, 4)}-${String(val.serviceDate).substring(4, 6)}-${String(val.serviceDate).substring(6, 8)}`
        : '';

      this.form.patchValue({
        serviceDate: serviceDateStr,
        recurringItemId: val.recurringItemId,
        appointmentId: val.appointmentId ?? null,
        userId: val.userId,
        serviceType: val.serviceType ?? '',
        vendorId: val.vendorId,
        serviceEstimate: val.serviceEstimate ?? null,
        serviceAmount: val.serviceAmount ?? null,
        invoiceDocument: val.invoiceDocument ?? null,
      });
    }
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
    appointmentId: new FormControl<number | null>(null, {
      nonNullable: false,
    }),
    userId: new FormControl(0, {
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
    serviceEstimate: new FormControl<number | null>(0, {
      nonNullable: false,
    }),
    serviceAmount: new FormControl<number | null>(0, {
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

    // Convert YYYY-MM-DD string to YYYYMMDD number
    const serviceDateNum = rawValue.serviceDate
      ? Number(rawValue.serviceDate.replace(/-/g, ''))
      : 0;

    const value: ServiceFormValue = {
      ...rawValue,
      serviceDate: serviceDateNum,
    };

    console.log('value', value);

    return this.submitHandler()(value);
  };
}

import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  IRecurringItemCreateDto,
  IRecurringItemEntity,
  ServicePeriodUnit,
} from 'service_reminder_common';
import { GenericButtonComponent } from '../../../shared/generic-button/generic-button';
import { GenericSelectComponent } from '../../../shared/generic-dropdown/generic-dropdown';
import { GenericInputComponent } from '../../../shared/generic-input/generic-input';

type RecurringItemFormValue = IRecurringItemCreateDto;

@Component({
  selector: 'app-recurring-item-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericInputComponent,
    GenericButtonComponent,
    GenericSelectComponent,
  ],
  templateUrl: './recurring-item-form.html',
  styleUrls: ['./recurring-item-form.css'],
})
export class RecurringItemFormComponent {
  submitHandler = input.required<(value: RecurringItemFormValue) => Observable<any>>();
  initialValue = input<IRecurringItemEntity | null>(null);

  ngOnInit() {
    const val = this.initialValue();
    if (val) {
      this.form.patchValue({
        name: val.name,
        type: val.type,
        companyName: val.companyName ?? '',
        servicePeriod: val.servicePeriod,
        servicePeriodUnit: val.servicePeriodUnit ?? '',
      });
    }
  }

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    type: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    companyName: new FormControl('', {
      nonNullable: true,
    }),
    servicePeriod: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    servicePeriodUnit: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  servicePeriodOptions = Object.values(ServicePeriodUnit).map((v) => ({
    label: v.charAt(0) + v.slice(1).toLowerCase(), // "MONTHS" → "Months"
    value: v,
  }));

  onClickSubmit = (): Observable<any> | void => {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    return this.submitHandler()(this.form.getRawValue() as RecurringItemFormValue);
  };
}

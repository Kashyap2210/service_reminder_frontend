import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  AppointmentType,
  IAppointmentCreateDto,
  IAppointmentEntity,
} from 'service_reminder_common';
import { GenericButtonComponent } from '../../../shared/generic-button/generic-button';
import { GenericSelectComponent } from '../../../shared/generic-dropdown/generic-dropdown';
import { GenericInputComponent } from '../../../shared/generic-input/generic-input';

type AppointmentFormValue = IAppointmentCreateDto;

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericInputComponent,
    GenericButtonComponent,
    GenericSelectComponent,
  ],
  templateUrl: './appointment-form.html',
  styleUrls: ['./appointment-form.css'],
})
export class AppointmentFormComponent {
  submitHandler = input.required<(value: AppointmentFormValue) => Observable<any>>();
  initialValue = input<IAppointmentEntity | null>(null);

  form = new FormGroup({
    appointmentDate: new FormControl('0', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    appointmentType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vendorId: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    recurringItemId: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    checkPoints: new FormControl('', {
      nonNullable: true,
    }),
  });

  appointmentTypeOptions = Object.values(AppointmentType).map((v) => ({
    label: v,
    value: v,
  }));

  ngOnInit() {
    const val = this.initialValue();
    if (val) {
      const rawDate = String(val.appointmentDate).padStart(8, '0');
      const formattedDate =
        rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : '';

      console.log('formattedDate', formattedDate);

      this.form.patchValue({
        appointmentDate: formattedDate,
        appointmentType: val.appointmentType,
        vendorId: val.vendorId,
        recurringItemId: val.recurringItemId,
        checkPoints: val.checkPoints ?? '',
      });
    }
  }

  onClickSubmit = (): Observable<any> | void => {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dateString = String(raw.appointmentDate);
    const appointmentDate = Number(dateString.replace(/-/g, ''));

    return this.submitHandler()({
      ...raw,
      appointmentDate,
    } as AppointmentFormValue);
  };
}

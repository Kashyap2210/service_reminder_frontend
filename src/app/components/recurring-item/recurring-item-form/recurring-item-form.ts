import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { IRecurringItemCreateDto } from 'service_reminder_common';
import { GenericButtonComponent } from '../../../shared/generic-button/generic-button';
import { GenericInputComponent } from '../../../shared/generic-input/generic-input';

type RecurringItemFormValue = IRecurringItemCreateDto;

@Component({
  selector: 'app-recurring-item-form',
  standalone: true,
  imports: [ReactiveFormsModule, GenericInputComponent, GenericButtonComponent],
  templateUrl: './recurring-item-form.html',
  styleUrls: ['./recurring-item-form.css'],
})
export class RecurringItemFormComponent {
  submitHandler = input.required<(value: RecurringItemFormValue) => Observable<any>>();

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
  });

  onClickSubmit = (): Observable<any> | void => {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    return this.submitHandler()(this.form.getRawValue() as RecurringItemFormValue);
  };
}

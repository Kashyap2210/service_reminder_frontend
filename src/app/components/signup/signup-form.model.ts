import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';
import { GenericInputComponent } from '../../shared/generic-input/generic-input';

export interface SignupFormValue {
  name: string;
  email: string;
  password: string;
  contactNo: string;
}

@Component({
  selector: 'app-signup-form',
  imports: [ReactiveFormsModule, GenericInputComponent, GenericButtonComponent],
  templateUrl: './signup-form.model.html',
  styleUrls: ['./signup-form.model.css'],
})
export class SignupFormComponent {
  submitHandler = input.required<(value: SignupFormValue) => Observable<any>>();

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    contactNo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{10}$/)],
    }),
  });

  handleSubmit = (): Observable<any> | void => {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    return this.submitHandler()(this.form.getRawValue());
  };
}

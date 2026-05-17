import { Component, input, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { GenericButtonComponent } from '../../shared/generic-button/generic-button';
import { GenericInputComponent } from '../../shared/generic-input/generic-input';

export interface LoginFormValue {
  name: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, GenericInputComponent, GenericButtonComponent],
  templateUrl: './login-form.model.html',
  styleUrls: ['./login-form.model.css'],
})
export class LoginFormComponent {
  submitHandler = input.required<(value: LoginFormValue) => Observable<any>>();

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  static nameMinLengthValidator(control: AbstractControl): ValidationErrors | null {
    return control.value?.length < 6
      ? { minlength: { requiredLength: 6, actualLength: control.value.length } }
      : null;
  }

  addValidatorsToForm() {
    this.form.controls.name.addValidators(LoginFormComponent.nameMinLengthValidator); // pass the fn reference, don't call it
    this.form.controls.name.updateValueAndValidity(); // re-run validation after change
  }

  removeValidatorsFromForm() {
    this.form.controls.name.removeValidators(LoginFormComponent.nameMinLengthValidator); // same reference to remove
    this.form.controls.name.updateValueAndValidity();
  }

  // Emits only when form is valid
  formSubmit = output<LoginFormValue>();

  onClickSubmit = (): Observable<any> | void => {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    return this.submitHandler()(this.form.getRawValue());
  };
}

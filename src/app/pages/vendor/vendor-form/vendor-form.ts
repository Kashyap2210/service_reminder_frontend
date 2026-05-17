import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { IVendorCreateDto, IVendorEntity } from 'service_reminder_common';
import { GenericButtonComponent } from '../../../shared/generic-button/generic-button';
import { GenericInputComponent } from '../../../shared/generic-input/generic-input';

type VendorFormValue = IVendorCreateDto;

@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [ReactiveFormsModule, GenericInputComponent, GenericButtonComponent],
  templateUrl: './vendor-form.html',
  styleUrls: ['./vendor-form.css'],
})
export class VendorFormComponent {
  submitHandler = input.required<(value: VendorFormValue) => Observable<any>>();
  initialValue = input<IVendorEntity | null>(null);

  ngOnInit() {
    const val = this.initialValue();
    if (val) {
      this.form.patchValue({
        name: val.name,
        contactNo: val.contactNo,
        email: val.email ?? '',
        address: val.address,
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

import { Component, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  AppointmentType,
  EntityFilterDataHelper,
  EntityList,
  IAppointmentCreateDto,
  IAppointmentEntity,
  RecurringItemModel,
} from 'service_reminder_common';
import { GenericButtonComponent } from '../../../shared/generic-button/generic-button';
import {
  GenericSelectComponent,
  SelectOption,
} from '../../../shared/generic-dropdown/generic-dropdown';
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
export class AppointmentFormComponent implements OnInit {
  entityFilterDataHelper = input.required<EntityFilterDataHelper>();
  submitHandler = input.required<(value: AppointmentFormValue) => Observable<any>>();
  initialValue = input<IAppointmentEntity | null>(null);

  vendorOptions: SelectOption<number>[] = [];
  recurringItemOptions: SelectOption<number>[] = [];
  selectedRecurringItem: RecurringItemModel | null = null;

  get vendorOptionsFromRecurringItem() {
    const recurringItemId = this.form.get('recurringItemId')?.value;
    const recurringItem = this.entityFilterDataHelper().entityModelsMap[
      EntityList.RECURRING_ITEM
    ].find((item) => item.id === recurringItemId);
    // console.log('recurringItem', recurringItem);

    return (
      recurringItem?.vendors
        ?.filter((v) => v !== undefined) // guard against sparse array
        .map((v) => ({
          label: v.name,
          value: v.id,
        })) ?? []
    );
  }

  form = new FormGroup({
    appointmentDate: new FormControl('0', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    appointmentType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    recurringItemId: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vendorId: new FormControl(0, {
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
    const vendors = this.entityFilterDataHelper().getEntityFromList(EntityList.VENDOR);
    const items = this.entityFilterDataHelper().getEntityFromList(EntityList.RECURRING_ITEM);

    this.vendorOptions = vendors.map((v) => ({ label: v.name, value: v.id }));
    this.recurringItemOptions = items.map((i) => ({ label: i.name, value: i.id }));

    // console.log(this.entityFilterDataHelper());

    const val = this.initialValue();
    if (val) {
      const rawDate = String(val.appointmentDate).padStart(8, '0');
      const formattedDate =
        rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : '';

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

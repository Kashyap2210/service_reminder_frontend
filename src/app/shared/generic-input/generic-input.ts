import { Component, inject, input, OnInit } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VALIDATION_MESSAGES_TOKEN } from '../../validation/validation-messages.token';

@Component({
  selector: 'app-generic-input',
  imports: [ReactiveFormsModule],
  templateUrl: './generic-input.html',
  styleUrl: './generic-input.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class GenericInputComponent implements OnInit {
  private messages = inject(VALIDATION_MESSAGES_TOKEN);
  private controlContainer = inject(ControlContainer);

  label = input<string>('');
  controlName = input.required<string>();
  type = input<string>('text');
  placeholder = input<string>('');

  control!: AbstractControl;

  ngOnInit() {
    this.control = (this.controlContainer.control as FormGroup).get(this.controlName())!;
  }

  get errorMessage(): string | null {
    if (!this.control.errors || (!this.control.touched && !this.control.dirty)) return null;
    const [key, val] = Object.entries(this.control.errors)[0];
    const resolver = this.messages[key];
    return resolver ? resolver(val) : 'Invalid value';
  }
}

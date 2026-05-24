import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { AbstractControl, ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { VALIDATION_MESSAGES_TOKEN } from '../../validation/validation-messages.token';

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-generic-multi-select',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon],
  templateUrl: './generic-multi-select.html',
  styleUrl: './generic-multi-select.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class GenericMultiSelectComponent<T = string> implements OnInit {
  private messages = inject(VALIDATION_MESSAGES_TOKEN);
  private controlContainer = inject(ControlContainer);
  private elementRef = inject(ElementRef);

  label = input<string>('');
  controlName = input.required<string>();
  placeholder = input<string>('');
  options = input.required<SelectOption<T>[]>();

  control!: AbstractControl;
  isOpen = signal(false);
  searchQuery = signal('');

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return query
      ? this.options().filter((o) => o.label.toLowerCase().includes(query))
      : this.options();
  });

  ngOnInit() {
    this.control = (this.controlContainer.control as FormGroup).get(this.controlName())!;
  }

  get selectedLabels(): string[] {
    const values = this.control?.value as T[];
    if (!values || !Array.isArray(values)) return [];
    return values
      .map((v) => this.options().find((o) => o.value === v)?.label)
      .filter((label) => label !== undefined) as string[];
  }

  get selectedCount(): number {
    const values = this.control?.value as T[];
    return Array.isArray(values) ? values.length : 0;
  }

  get errorMessage(): string | null {
    if (!this.control.errors || (!this.control.touched && !this.control.dirty)) return null;
    const [key, val] = Object.entries(this.control.errors)[0];
    const resolver = this.messages[key];
    return resolver ? resolver(val) : 'Invalid value';
  }

  toggleDropdown() {
    this.isOpen.update((v) => !v);
    if (!this.isOpen()) this.searchQuery.set('');
  }

  isOptionSelected(option: SelectOption<T>): boolean {
    const values = this.control?.value as T[];
    if (!values || !Array.isArray(values)) return false;
    return values.includes(option.value);
  }

  toggleOption(option: SelectOption<T>) {
    const currentValues = (this.control?.value as T[]) || [];
    const isSelected = currentValues.includes(option.value);

    const newValues = isSelected
      ? currentValues.filter((v) => v !== option.value)
      : [...currentValues, option.value];

    this.control.setValue(newValues);
    this.control.markAsTouched();
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.searchQuery.set('');
    }
  }
}

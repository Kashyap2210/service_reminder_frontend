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

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-generic-select',
  imports: [ReactiveFormsModule, MatIcon],
  templateUrl: './generic-dropdown.html',
  styleUrl: './generic-dropdown.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class GenericSelectComponent implements OnInit {
  private messages = inject(VALIDATION_MESSAGES_TOKEN);
  private controlContainer = inject(ControlContainer);
  private elementRef = inject(ElementRef);

  label = input<string>('');
  controlName = input.required<string>();
  placeholder = input<string>('');
  options = input.required<SelectOption[]>();

  control!: AbstractControl;
  isOpen = signal(false);
  searchQuery = signal('');

  ngOnInit() {
    this.control = (this.controlContainer.control as FormGroup).get(this.controlName())!;
  }

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return query
      ? this.options().filter((o) => o.label.toLowerCase().includes(query))
      : this.options();
  });

  get selectedLabel(): string {
    const val = this.control?.value;
    return this.options().find((o) => o.value === val)?.label ?? '';
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

  selectOption(option: SelectOption) {
    this.control.setValue(option.value);
    this.control.markAsTouched();
    this.isOpen.set(false);
    this.searchQuery.set('');
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

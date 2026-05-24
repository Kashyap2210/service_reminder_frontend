// dropdown-menu.component.ts
import { Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

export interface DropdownMenuItem {
  label: string;
  value: string;
  danger?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-dropdown-menu',
  // imports:[MatIcon]
  standalone: true,
  templateUrl: './dropdown.html',
  styleUrl: '../../shared/generic-dropdown/generic-dropdown.scss',
  imports: [MatIcon],
  // reuse the same styles
})
export class DropdownMenuComponent {
  private elementRef = inject(ElementRef);

  triggerLabel = input<string>('Take action');
  items = input.required<DropdownMenuItem[]>();
  itemSelected = output<DropdownMenuItem>();

  isOpen = signal(false);

  toggle() {
    this.isOpen.update((v) => !v);
  }

  select(item: DropdownMenuItem) {
    this.itemSelected.emit(item);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}

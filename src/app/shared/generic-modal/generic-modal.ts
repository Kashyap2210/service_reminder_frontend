import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericButtonComponent } from '../generic-button/generic-button';

@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [CommonModule, GenericButtonComponent],
  templateUrl: './generic-modal.html',
  styleUrl: './generic-modal.scss',
})
export class GenericModalComponent {
  @Input() message!: string;
  @Input() confirmHandler!: () => Observable<any> | void;
  @Input() confirmText = 'Delete';

  isOpen = signal(false);

  open() {
    this.isOpen.set(true);
  }

  close = () => {
    this.isOpen.set(false);
  };
}

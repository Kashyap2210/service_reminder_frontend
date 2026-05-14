import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { finalize, isObservable, Observable } from 'rxjs';
@Component({
  selector: 'app-generic-button',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  templateUrl: './generic-button.html',
  styleUrl: './generic-button.scss',
})
export class GenericButtonComponent {
  @Input() handler!: () => Observable<any> | void;
  @Input() btnClass: string = '';
  _processing = false;
  handleClick() {
    if (!this.handler) return;
    const result = this.handler();
    if (!result || !isObservable(result)) return;
    this._processing = true;
    result.pipe(finalize(() => (this._processing = false))).subscribe();
  }
}

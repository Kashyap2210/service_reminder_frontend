import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericButtonComponent } from '../../generic-button/generic-button';

@Component({
  selector: 'app-cancel-button',
  standalone: true,
  imports: [GenericButtonComponent],
  templateUrl: './cancel-button.html',
  styleUrl: './cancel-button.scss',
})
export class CancelButtonComponent {
  @Input() handler!: () => Observable<any> | void;
}

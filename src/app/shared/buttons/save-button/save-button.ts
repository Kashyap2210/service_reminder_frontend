import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericButtonComponent } from '../../generic-button/generic-button';

@Component({
  selector: 'app-submit-button',
  standalone: true,
  imports: [GenericButtonComponent],
  templateUrl: './save-button.html',
  styleUrl: './save-button.scss',
})
export class SubmitButtonComponent {
  @Input() handler!: () => Observable<any> | void;
}

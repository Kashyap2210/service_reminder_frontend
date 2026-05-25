import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericButtonComponent } from '../../generic-button/generic-button';

@Component({
  selector: 'app-delete-button',
  standalone: true,
  imports: [GenericButtonComponent],
  templateUrl: './delete-button.html',
  styleUrl: './delete-button.scss',
})
export class DeleteButtonComponent {
  @Input() handler!: () => Observable<any> | void;
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EntityList,
  IAppointmentCreateDto,
  IAppointmentEntity,
  IAppointmentSearchDto,
  IAppointmentUpdateDto,
} from 'service_reminder_common';
import { BaseService } from '../../shared/shared.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService extends BaseService {
  constructor() {
    super(EntityList.APPOINTMENT);
  }

  // private http = inject(HttpClient);
  private baseUrl = `http://localhost:3000/api/v1/${EntityList.APPOINTMENT}`;

  search(dto: IAppointmentSearchDto): Observable<IAppointmentEntity[]> {
    return this.http.post<IAppointmentEntity[]>(`${this.baseUrl}/search`, dto);
  }

  create(dto: IAppointmentCreateDto): Observable<IAppointmentEntity> {
    return this.http.post<IAppointmentEntity>(`${this.baseUrl}`, dto);
  }

  update(id: number, dto: IAppointmentUpdateDto): Observable<IAppointmentEntity> {
    return this.http.patch<IAppointmentEntity>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}

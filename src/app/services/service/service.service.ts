import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EntityList,
  IServiceCreateDto,
  IServiceEntity,
  IServiceSearchDto,
  IServiceUpdateDto,
} from 'service_reminder_common';
import { BaseService } from '../../shared/shared.service';

@Injectable({ providedIn: 'root' })
export class ServiceApiService extends BaseService {
  constructor() {
    super(EntityList.SERVICE);
  }

  // private http = inject(HttpClient);
  private baseUrl = `http://localhost:3000/api/v1/${EntityList.SERVICE}`;

  search(dto: IServiceSearchDto): Observable<IServiceEntity[]> {
    return this.http.post<IServiceEntity[]>(`${this.baseUrl}/search`, dto);
  }

  create(dto: IServiceCreateDto): Observable<IServiceEntity> {
    return this.http.post<IServiceEntity>(`${this.baseUrl}`, dto);
  }

  update(id: number, dto: IServiceUpdateDto): Observable<IServiceEntity> {
    return this.http.patch<IServiceEntity>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}

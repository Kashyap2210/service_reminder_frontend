import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EntityList,
  IRecurringItemCreateDto,
  IRecurringItemEntity,
  IRecurringItemSearchDto,
  IRecurringItemUpdateDto,
} from 'service_reminder_common';
import { BaseService } from '../../shared/shared.service';

@Injectable({ providedIn: 'root' })
export class RecurringItemService extends BaseService {
  constructor() {
    super(EntityList.RECURRING_ITEM);
  }

  // private http = inject(HttpClient);
  private baseUrl = `http://localhost:3000/api/v1/${EntityList.RECURRING_ITEM}`;

  search(dto: IRecurringItemSearchDto): Observable<IRecurringItemEntity[]> {
    return this.http.post<IRecurringItemEntity[]>(`${this.baseUrl}/search`, dto);
  }

  create(dto: IRecurringItemCreateDto): Observable<IRecurringItemEntity> {
    return this.http.post<IRecurringItemEntity>(`${this.baseUrl}`, dto);
  }

  update(id: number, dto: IRecurringItemUpdateDto): Observable<IRecurringItemEntity> {
    return this.http.patch<IRecurringItemEntity>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}

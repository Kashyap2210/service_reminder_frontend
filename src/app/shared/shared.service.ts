import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityList, IEntityFilterSearchData, ISearchV2Response } from 'service_reminder_common';

@Injectable({ providedIn: 'root' })
export abstract class BaseService {
  constructor(protected readonly entityName: EntityList) {}

  protected http = inject(HttpClient);

  //   search(dto: IRecurringItemSearchDto): Observable<IRecurringItemEntity[]> {
  //     return this.http.post<IRecurringItemEntity[]>(`${this.baseUrl}/search`, dto);
  //   }

  baseSearch(dto: IEntityFilterSearchData<typeof this.entityName>): Observable<ISearchV2Response> {
    return this.http.post<ISearchV2Response>(`http://localhost:3000/api/v1/entity/search`, dto);
  }
}

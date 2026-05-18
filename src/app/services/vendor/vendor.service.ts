import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EntityList,
  IVendorCreateDto,
  IVendorEntity,
  IVendorSearchDto,
  IVendorUpdateDto,
} from 'service_reminder_common';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private http = inject(HttpClient);
  private baseUrl = `http://localhost:3000/api/v1/${EntityList.VENDOR}`;

  search(dto: IVendorSearchDto): Observable<IVendorEntity[]> {
    return this.http.post<IVendorEntity[]>(`${this.baseUrl}/search`, dto);
  }

  create(dto: IVendorCreateDto): Observable<IVendorEntity> {
    return this.http.post<IVendorEntity>(`${this.baseUrl}`, dto);
  }

  update(id: number, dto: IVendorUpdateDto): Observable<IVendorEntity> {
    return this.http.patch<IVendorEntity>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}

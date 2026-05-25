import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EntityList,
  IUserCreateDto,
  IUserEntity,
  IUserSearchDto,
  IUserUpdateDto,
} from 'service_reminder_common';
import { BaseService } from '../../shared/shared.service';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseService {
  constructor() {
    super(EntityList.USER);
  }

  private baseUrl = `http://localhost:3000/api/v1/${EntityList.USER}`;

  search(dto: IUserSearchDto): Observable<IUserEntity[]> {
    return this.http.post<IUserEntity[]>(`${this.baseUrl}/search`, dto);
  }

  create(dto: IUserCreateDto): Observable<IUserEntity> {
    return this.http.post<IUserEntity>(`${this.baseUrl}`, dto);
  }

  update(id: number, dto: IUserUpdateDto): Observable<IUserEntity> {
    return this.http.patch<IUserEntity>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}

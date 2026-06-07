import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IncomeRequest, IncomeResponse } from '../models/income.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private readonly API = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<IncomeResponse[]> {
    return this.http.get<IncomeResponse[]>(this.API);
  }

  create(request: IncomeRequest): Observable<IncomeResponse> {
    return this.http.post<IncomeResponse>(this.API, request);
  }

  update(id: string, request: IncomeRequest): Observable<IncomeResponse> {
    return this.http.put<IncomeResponse>(`${this.API}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
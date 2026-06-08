import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BudgetRequest, BudgetResponse } from '../models/budget.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly API = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  getByMonthAndYear(month: number, year: number): Observable<BudgetResponse[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<BudgetResponse[]>(this.API, { params });
  }

  create(request: BudgetRequest): Observable<BudgetResponse> {
    return this.http.post<BudgetResponse>(this.API, request);
  }

  update(id: string, request: BudgetRequest): Observable<BudgetResponse> {
    return this.http.put<BudgetResponse>(`${this.API}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
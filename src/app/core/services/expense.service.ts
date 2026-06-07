import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseRequest, ExpenseResponse } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly API = 'http://localhost:8080/api/v1/expenses';

  constructor(private http: HttpClient) {}

  getAll(from?: string, to?: string): Observable<ExpenseResponse[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<ExpenseResponse[]>(this.API, { params });
  }

  getById(id: string): Observable<ExpenseResponse> {
    return this.http.get<ExpenseResponse>(`${this.API}/${id}`);
  }

  create(request: ExpenseRequest): Observable<ExpenseResponse> {
    return this.http.post<ExpenseResponse>(this.API, request);
  }

  update(id: string, request: ExpenseRequest): Observable<ExpenseResponse> {
    return this.http.put<ExpenseResponse>(`${this.API}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
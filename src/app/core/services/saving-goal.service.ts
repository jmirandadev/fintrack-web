import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SavingGoalRequest, SavingGoalResponse } from '../models/saving-goal.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SavingGoalService {
  private readonly API = `${environment.apiUrl}/saving-goals`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SavingGoalResponse[]> {
    return this.http.get<SavingGoalResponse[]>(this.API);
  }

  create(request: SavingGoalRequest): Observable<SavingGoalResponse> {
    return this.http.post<SavingGoalResponse>(this.API, request);
  }

  update(id: string, request: SavingGoalRequest): Observable<SavingGoalResponse> {
    return this.http.put<SavingGoalResponse>(`${this.API}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
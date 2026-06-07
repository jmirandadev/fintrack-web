import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>📈 Reportes</h1>
      </div>

      <div class="filters">
        <select [(ngModel)]="selectedMonth" name="month" class="form-input" (change)="loadReport()">
          <option *ngFor="let m of months; let i = index" [value]="i+1">{{ m }}</option>
        </select>
        <select [(ngModel)]="selectedYear" name="year" class="form-input" (change)="loadReport()">
          <option *ngFor="let y of years" [value]="y">{{ y }}</option>
        </select>
      </div>

      <div *ngIf="loading" class="loading">Cargando reporte...</div>

      <div *ngIf="!loading && report">
        <div class="cards-grid">
          <div class="card card-green">
            <p class="card-label">Ingresos</p>
            <h2>{{ report.currency }} {{ report.totalIncomes | number:'1.2-2' }}</h2>
            <span class="variation" [class.up]="report.incomeVariation >= 0" [class.down]="report.incomeVariation < 0">
              {{ report.incomeVariation >= 0 ? '↑' : '↓' }} {{ report.incomeVariation | number:'1.0-0' }}% vs mes anterior
            </span>
          </div>
          <div class="card card-red">
            <p class="card-label">Gastos</p>
            <h2>{{ report.currency }} {{ report.totalExpenses | number:'1.2-2' }}</h2>
            <span class="variation" [class.up]="report.expenseVariation < 0" [class.down]="report.expenseVariation >= 0">
              {{ report.expenseVariation >= 0 ? '↑' : '↓' }} {{ report.expenseVariation | number:'1.0-0' }}% vs mes anterior
            </span>
          </div>
          <div class="card" [class.card-green]="report.balance >= 0" [class.card-red]="report.balance < 0">
            <p class="card-label">Balance</p>
            <h2>{{ report.currency }} {{ report.balance | number:'1.2-2' }}</h2>
          </div>
        </div>

        <div class="section" *ngIf="report.expensesByCategory.length > 0">
          <h3>Gastos por categoría</h3>
          <div class="category-row" *ngFor="let cat of report.expensesByCategory">
            <span class="cat-name">{{ cat.categoryName }}</span>
            <div class="cat-bar">
              <div class="cat-fill" [style.width.%]="cat.percentage"></div>
            </div>
            <span class="cat-amount">{{ report.currency }} {{ cat.total | number:'1.2-2' }}</span>
            <span class="cat-pct">{{ cat.percentage | number:'1.0-0' }}%</span>
          </div>
        </div>

        <div class="section" *ngIf="report.expensesByPaymentMethod.length > 0">
          <h3>Gastos por método de pago</h3>
          <div class="category-row" *ngFor="let pm of report.expensesByPaymentMethod">
            <span class="cat-name">{{ pm.paymentMethodName }}</span>
            <div class="cat-bar">
              <div class="cat-fill blue" [style.width.%]="pm.percentage"></div>
            </div>
            <span class="cat-amount">{{ report.currency }} {{ pm.total | number:'1.2-2' }}</span>
            <span class="cat-pct">{{ pm.percentage | number:'1.0-0' }}%</span>
          </div>
        </div>

        <div class="section" *ngIf="report.expensesByCategory.length === 0 && report.expensesByPaymentMethod.length === 0">
          <p class="empty">No hay gastos registrados en este período.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 100%; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 28px; color: #1e293b; }
    .filters { display: flex; gap: 12px; margin-bottom: 24px; }
    .form-input { padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
    .loading { text-align: center; padding: 48px; color: #64748b; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #e5e7eb; }
    .card-green { border-left-color: #10b981; }
    .card-red { border-left-color: #ef4444; }
    .card-label { margin: 0 0 8px; font-size: 13px; color: #64748b; text-transform: uppercase; }
    .card h2 { margin: 0 0 8px; font-size: 24px; color: #1e293b; }
    .variation { font-size: 13px; }
    .up { color: #10b981; }
    .down { color: #ef4444; }
    .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section h3 { margin: 0 0 20px; color: #1e293b; }
    .category-row { display: grid; grid-template-columns: 160px 1fr 120px 60px; align-items: center; gap: 12px; margin-bottom: 12px; }
    .cat-name { font-size: 14px; color: #374151; }
    .cat-bar { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .cat-fill { height: 100%; background: #ef4444; border-radius: 4px; }
    .cat-fill.blue { background: #3b82f6; }
    .cat-amount { font-size: 14px; font-weight: 600; color: #1e293b; text-align: right; }
    .cat-pct { font-size: 13px; color: #64748b; text-align: right; }
    .empty { text-align: center; color: #94a3b8; padding: 24px 0; }
    @media (max-width: 768px) {
      .category-row { grid-template-columns: 1fr 1fr; }
      .cat-bar { display: none; }
    }
  `]
})
export class ReportsComponent implements OnInit {
  report: any = null;
  loading = false;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  years = [2024, 2025, 2026, 2027];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.http.get(`http://localhost:8080/api/v1/reports/monthly?month=${this.selectedMonth}&year=${this.selectedYear}`)
      .subscribe({
        next: (data: any) => {
          this.report = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
}
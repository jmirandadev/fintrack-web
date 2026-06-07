import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardResponse } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>📊 Dashboard</h1>
        <p>{{ monthName }} {{ data?.year }}</p>
      </div>

      <div *ngIf="loading" class="loading">Cargando...</div>

      <div *ngIf="!loading && data">
        <div class="cards-grid">
          <div class="card card-green">
            <div class="card-icon">💵</div>
            <div class="card-content">
              <p class="card-label">Ingresos</p>
              <h2 class="card-amount">{{ data.currency }} {{ data.totalIncomes | number:'1.2-2' }}</h2>
            </div>
          </div>
          <div class="card card-red">
            <div class="card-icon">💸</div>
            <div class="card-content">
              <p class="card-label">Gastos</p>
              <h2 class="card-amount">{{ data.currency }} {{ data.totalExpenses | number:'1.2-2' }}</h2>
            </div>
          </div>
          <div class="card" [class.card-green]="data.balance >= 0" [class.card-red]="data.balance < 0">
            <div class="card-icon">⚖️</div>
            <div class="card-content">
              <p class="card-label">Balance</p>
              <h2 class="card-amount">{{ data.currency }} {{ data.balance | number:'1.2-2' }}</h2>
            </div>
          </div>
        </div>

        <div class="section" *ngIf="data.budgets.length > 0">
          <h3>🎯 Presupuestos del mes</h3>
          <div class="budgets-list">
            <div class="budget-item" *ngFor="let budget of data.budgets">
              <div class="budget-header">
                <span class="budget-name">{{ budget.categoryName }}</span>
                <span class="budget-amount" [class.exceeded]="budget.exceeded">
                  {{ budget.currency }} {{ budget.consumed | number:'1.2-2' }} / {{ budget.limitAmount | number:'1.2-2' }}
                </span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill"
                  [style.width.%]="budget.percentageUsed > 100 ? 100 : budget.percentageUsed"
                  [class.exceeded]="budget.exceeded">
                </div>
              </div>
              <span class="budget-pct" [class.exceeded]="budget.exceeded">{{ budget.percentageUsed | number:'1.0-0' }}%</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h3>💸 Últimos gastos</h3>
            <a routerLink="/expenses" class="ver-todos">Ver todos →</a>
          </div>
          <table *ngIf="data.recentExpenses.length > 0">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Método</th>
                <th>Fecha</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let expense of data.recentExpenses">
                <td>{{ expense.description }}</td>
                <td><span class="badge">{{ expense.categoryName }}</span></td>
                <td>{{ expense.paymentMethodName }}</td>
                <td>{{ expense.expenseDate }}</td>
                <td class="amount-red">{{ expense.currency }} {{ expense.amount | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="data.recentExpenses.length === 0" class="empty">
            No hay gastos registrados este mes.
            <a routerLink="/expenses">Agregar gasto</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 100%; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 28px; color: #1e293b; }
    .page-header p { margin: 4px 0 0; color: #64748b; }
    .loading { text-align: center; padding: 48px; color: #64748b; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: white; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #e5e7eb; }
    .card-green { border-left-color: #10b981; }
    .card-red { border-left-color: #ef4444; }
    .card-icon { font-size: 32px; }
    .card-label { margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .card-amount { margin: 4px 0 0; font-size: 24px; font-weight: 700; color: #1e293b; }
    .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section h3 { margin: 0 0 20px; color: #1e293b; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h3 { margin: 0; }
    .ver-todos { color: #3b82f6; text-decoration: none; font-size: 14px; }
    .budget-item { margin-bottom: 16px; }
    .budget-header { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
    .budget-name { font-weight: 600; color: #374151; }
    .budget-amount { color: #64748b; }
    .budget-amount.exceeded { color: #ef4444; font-weight: 600; }
    .budget-pct { font-size: 12px; color: #64748b; }
    .budget-pct.exceeded { color: #ef4444; }
    .progress-bar { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #10b981; border-radius: 4px; }
    .progress-fill.exceeded { background: #ef4444; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px; font-size: 13px; color: #64748b; border-bottom: 2px solid #f1f5f9; }
    td { padding: 12px; font-size: 14px; border-bottom: 1px solid #f8fafc; }
    .badge { background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
    .amount-red { color: #ef4444; font-weight: 600; }
    .empty { text-align: center; color: #94a3b8; padding: 24px 0; }
    .empty a { color: #3b82f6; }
    @media (max-width: 768px) {
      .cards-grid { grid-template-columns: 1fr; }
      table { font-size: 12px; }
      th, td { padding: 8px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  data: DashboardResponse | null = null;
  loading = true;

  months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  get monthName(): string {
    return this.data ? this.months[this.data.month - 1] : '';
  }

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: data => {
        this.data = data;
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
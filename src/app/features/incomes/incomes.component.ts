import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService } from '../../core/services/income.service';
import { IncomeResponse, IncomeRequest, INCOME_SOURCES } from '../../core/models/income.model';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>💵 Ingresos</h1>
        <button class="btn-primary" (click)="toggleForm()">
          {{ showForm ? '✕ Cancelar' : '+ Nuevo ingreso' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <h3>{{ editingId ? 'Editar ingreso' : 'Nuevo ingreso' }}</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label>Descripción</label>
              <input type="text" [(ngModel)]="form.description" name="description"
                required class="form-input" placeholder="Ej: Salario junio"/>
            </div>
            <div class="form-group">
              <label>Monto</label>
              <input type="number" [(ngModel)]="form.amount" name="amount"
                required min="0.01" step="0.01" class="form-input"/>
            </div>
            <div class="form-group">
              <label>Fecha</label>
              <input type="date" [(ngModel)]="form.incomeDate" name="incomeDate"
                required class="form-input"/>
            </div>
            <div class="form-group">
              <label>Tipo de ingreso</label>
              <select [(ngModel)]="form.sourceType" name="sourceType" class="form-input">
                <option *ngFor="let s of sources" [value]="s.value">{{ s.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Moneda</label>
              <select [(ngModel)]="form.currency" name="currency" class="form-input">
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="loading">
              {{ loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </form>
      </div>

      <div class="table-card">
        <div *ngIf="loadingList" class="loading">Cargando...</div>
        <table *ngIf="!loadingList && incomes.length > 0">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let income of incomes">
              <td>{{ income.description }}</td>
              <td><span class="badge">{{ getSourceLabel(income.sourceType) }}</span></td>
              <td>{{ income.incomeDate }}</td>
              <td class="amount-green">{{ income.currency }} {{ income.amount | number:'1.2-2' }}</td>
              <td>
                <button class="btn-icon" (click)="onEdit(income)">✏️</button>
                <button class="btn-icon danger" (click)="onDelete(income.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="!loadingList && incomes.length === 0" class="empty">No hay ingresos registrados.</p>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 28px; color: #1e293b; }
    .btn-primary { padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #059669; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .form-card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .form-card h3 { margin: 0 0 20px; color: #1e293b; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; }
    .form-input:focus { border-color: #10b981; }
    .form-actions { margin-top: 8px; }
    .table-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px; font-size: 13px; color: #64748b; border-bottom: 2px solid #f1f5f9; }
    td { padding: 12px; font-size: 14px; border-bottom: 1px solid #f8fafc; }
    .badge { background: #f0fdf4; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
    .amount-green { color: #10b981; font-weight: 600; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 4px; }
    .btn-icon:hover { background: #f1f5f9; }
    .loading { text-align: center; padding: 48px; color: #64748b; }
    .empty { text-align: center; color: #94a3b8; padding: 48px 0; }
  `]
})
export class IncomesComponent implements OnInit {
  incomes: IncomeResponse[] = [];
  sources = INCOME_SOURCES;
  showForm = false;
  loading = false;
  loadingList = true;
  editingId: string | null = null;

  form: IncomeRequest = {
    amount: 0,
    currency: 'PEN',
    incomeDate: new Date().toISOString().split('T')[0],
    description: '',
    sourceType: 'SALARY'
  };

  constructor(
    private incomeService: IncomeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadIncomes();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.cdr.detectChanges();
  }

  loadIncomes(): void {
    this.incomeService.getAll().subscribe({
      next: data => {
        this.incomes = data;
        this.loadingList = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingList = false;
        this.cdr.detectChanges();
      }
    });
  }

  getSourceLabel(value: string): string {
    return this.sources.find(s => s.value === value)?.label || value;
  }

  onSubmit(): void {
    this.loading = true;
    const obs = this.editingId
      ? this.incomeService.update(this.editingId, this.form)
      : this.incomeService.create(this.form);

    obs.subscribe({
      next: () => {
        this.loadIncomes();
        this.resetForm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onEdit(income: IncomeResponse): void {
    this.editingId = income.id;
    this.form = {
      amount: income.amount,
      currency: income.currency,
      incomeDate: income.incomeDate,
      description: income.description,
      sourceType: income.sourceType
    };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  onDelete(id: string): void {
    if (!confirm('¿Eliminar este ingreso?')) return;
    this.incomeService.delete(id).subscribe({
      next: () => {
        this.loadIncomes();
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.showForm = false;
    this.form = {
      amount: 0,
      currency: 'PEN',
      incomeDate: new Date().toISOString().split('T')[0],
      description: '',
      sourceType: 'SALARY'
    };
    this.cdr.detectChanges();
  }
}
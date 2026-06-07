import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseResponse, ExpenseRequest } from '../../core/models/expense.model';
import { CategoryResponse } from '../../core/models/category.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>💸 Gastos</h1>
        <button class="btn-primary" (click)="toggleForm()">
          {{ showForm ? '✕ Cancelar' : '+ Nuevo gasto' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <h3>{{ editingId ? 'Editar gasto' : 'Nuevo gasto' }}</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label>Descripción</label>
              <input
                type="text"
                [(ngModel)]="form.description"
                name="description"
                required
                class="form-input"
                placeholder="Ej: Almuerzo"
              />
            </div>
            <div class="form-group">
              <label>Monto</label>
              <input
                type="number"
                [(ngModel)]="form.amount"
                name="amount"
                required
                min="0.01"
                step="0.01"
                class="form-input"
                placeholder="0.00"
              />
            </div>
            <div class="form-group">
              <label>Fecha</label>
              <input
                type="date"
                [(ngModel)]="form.expenseDate"
                name="expenseDate"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Categoría</label>
              <select [(ngModel)]="form.categoryId" name="categoryId" required class="form-input">
                <option value="">Seleccionar...</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Método de pago</label>
              <select
                [(ngModel)]="form.paymentMethodId"
                name="paymentMethodId"
                required
                class="form-input"
              >
                <option value="">Seleccionar...</option>
                <option *ngFor="let pm of paymentMethods" [value]="pm.id">{{ pm.name }}</option>
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
          <div class="form-group">
            <label>Notas (opcional)</label>
            <input type="text" [(ngModel)]="form.notes" name="notes" class="form-input" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="loading">
              {{ loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>

      <div class="table-card">
        <div *ngIf="loadingList" class="loading">Cargando...</div>
        <table *ngIf="!loadingList && expenses.length > 0">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Método</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let expense of expenses">
              <td>{{ expense.description }}</td>
              <td>
                <span class="badge">{{ expense.categoryName }}</span>
              </td>
              <td>{{ expense.paymentMethodName }}</td>
              <td>{{ expense.expenseDate }}</td>
              <td class="amount-red">
                {{ expense.currency }} {{ expense.amount | number: '1.2-2' }}
              </td>
              <td>
                <button class="btn-icon" (click)="onEdit(expense)">✏️</button>
                <button class="btn-icon danger" (click)="onDelete(expense.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loadingList && expenses.length === 0" class="empty-state">
  <div class="empty-icon">💸</div>
  <h3>No hay gastos registrados</h3>
  <p>Haz clic en "+ Nuevo gasto" para agregar tu primer gasto</p>
</div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 100%;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .page-header h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 800;
        color: #111827;
        letter-spacing: -0.5px;
      }
      .btn-primary {
        padding: 10px 20px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
      }
      .btn-primary:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .form-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        border: 1px solid #e8eaed;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
      .form-card h3 {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f1f5f9;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 16px;
      }
      .form-group label {
        font-size: 11px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .form-input {
        padding: 10px 14px;
        border: 1.5px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        width: 100%;
        outline: none;
        transition:
          border-color 0.15s,
          box-shadow 0.15s;
      }
      .form-input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      .form-actions {
        margin-top: 4px;
      }

      .table-card {
        background: white;
        border-radius: 12px;
        border: 1px solid #e8eaed;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        min-height: unset;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      thead {
        background: #f8f9fb;
      }
      th {
        text-align: left;
        padding: 12px 16px;
        font-size: 11px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #e8eaed;
      }
      td {
        padding: 14px 16px;
        font-size: 14px;
        border-bottom: 1px solid #f9fafb;
      }
      tr:last-child td {
        border-bottom: none;
      }
      tr:hover td {
        background: #f8f9fb;
      }

      .badge {
        display: inline-flex;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
      }
      .amount-red {
        color: #dc2626;
        font-weight: 700;
      }
      .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        font-size: 15px;
        transition: background 0.15s;
      }
      .btn-icon:hover {
        background: #f1f5f9;
      }
      .btn-icon.danger:hover {
        background: #fef2f2;
      }

      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 80px;
        color: #9ca3af;
        gap: 10px;
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 24px;
        color: #9ca3af;
        text-align: center;
      }
      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      .empty-state h3 {
        font-size: 16px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 6px;
      }
      .empty-state p {
        font-size: 14px;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr 1fr;
        }
        table {
          font-size: 13px;
        }
        th,
        td {
          padding: 10px 12px;
        }
      }
    `,
  ],
})
export class ExpensesComponent implements OnInit {
  expenses: ExpenseResponse[] = [];
  categories: CategoryResponse[] = [];
  paymentMethods: any[] = [];
  showForm = false;
  loading = false;
  loadingList = true;
  editingId: string | null = null;

  form: ExpenseRequest = {
    amount: 0,
    currency: 'PEN',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: '',
    paymentMethodId: '',
  };

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.loadCategories();
    this.loadPaymentMethods();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.cdr.detectChanges();
  }

  loadExpenses(): void {
    this.expenseService.getAll().subscribe({
      next: (data) => {
        this.expenses = data;
        this.loadingList = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingList = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
    });
  }

  loadPaymentMethods(): void {
    fetch('http://localhost:8080/api/v1/payment-methods', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then((data) => {
        this.paymentMethods = data;
        this.cdr.detectChanges();
      });
  }

  onSubmit(): void {
    this.loading = true;
    const obs = this.editingId
      ? this.expenseService.update(this.editingId, this.form)
      : this.expenseService.create(this.form);

    obs.subscribe({
      next: () => {
        this.loadExpenses();
        this.resetForm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onEdit(expense: ExpenseResponse): void {
    this.editingId = expense.id;
    this.form = {
      amount: expense.amount,
      currency: expense.currency,
      expenseDate: expense.expenseDate,
      description: expense.description,
      notes: expense.notes,
      categoryId: expense.categoryId,
      paymentMethodId: expense.paymentMethodId,
    };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  onDelete(id: string): void {
    if (!confirm('¿Eliminar este gasto?')) return;
    this.expenseService.delete(id).subscribe({
      next: () => {
        this.loadExpenses();
        this.cdr.detectChanges();
      },
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.showForm = false;
    this.form = {
      amount: 0,
      currency: 'PEN',
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
      categoryId: '',
      paymentMethodId: '',
    };
    this.cdr.detectChanges();
  }
}

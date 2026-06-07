import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { BudgetResponse, BudgetRequest } from '../../core/models/budget.model';
import { CategoryResponse } from '../../core/models/category.model';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>🎯 Presupuestos</h1>
        <button class="btn-primary" (click)="toggleForm()">
          {{ showForm ? '✕ Cancelar' : '+ Nuevo presupuesto' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <h3>Nuevo presupuesto</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label>Categoría</label>
              <select [(ngModel)]="form.categoryId" name="categoryId" class="form-input">
                <option value="">Seleccionar...</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Límite</label>
              <input type="number" [(ngModel)]="form.limitAmount" name="limitAmount"
                required min="0.01" step="0.01" class="form-input" placeholder="0.00"/>
            </div>
            <div class="form-group">
              <label>Mes</label>
              <select [(ngModel)]="form.month" name="month" class="form-input">
                <option *ngFor="let m of months; let i = index" [value]="i+1">{{ m }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Año</label>
              <input type="number" [(ngModel)]="form.year" name="year" required class="form-input"/>
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
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>

      <div *ngIf="loadingList" class="loading">Cargando...</div>

      <div class="budgets-grid" *ngIf="!loadingList">
        <div class="budget-card" *ngFor="let budget of budgets" [class.exceeded]="budget.exceeded">
          <div class="budget-header">
            <h3>{{ budget.categoryName || 'General' }}</h3>
            <button class="btn-icon danger" (click)="onDelete(budget.id)">🗑️</button>
          </div>
          <div class="budget-amounts">
            <span class="consumed">{{ budget.currency }} {{ budget.consumed | number:'1.2-2' }}</span>
            <span class="separator">/</span>
            <span class="limit">{{ budget.limitAmount | number:'1.2-2' }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"
              [style.width.%]="budget.percentageUsed > 100 ? 100 : budget.percentageUsed"
              [class.exceeded]="budget.exceeded">
            </div>
          </div>
          <div class="budget-footer">
            <span [class.exceeded]="budget.exceeded">{{ budget.percentageUsed | number:'1.0-0' }}% utilizado</span>
            <span class="remaining" *ngIf="!budget.exceeded">Resta: {{ budget.currency }} {{ budget.remaining | number:'1.2-2' }}</span>
            <span class="exceeded-label" *ngIf="budget.exceeded">⚠️ Superado</span>
          </div>
        </div>
        <p *ngIf="budgets.length === 0" class="empty">No hay presupuestos para este mes.</p>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 28px; color: #1e293b; }
    .btn-primary { padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #7c3aed; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .form-card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .form-card h3 { margin: 0 0 20px; color: #1e293b; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; }
    .form-input:focus { border-color: #8b5cf6; }
    .form-actions { margin-top: 8px; }
    .budgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .budget-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #8b5cf6; }
    .budget-card.exceeded { border-left-color: #ef4444; }
    .budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .budget-header h3 { margin: 0; font-size: 16px; color: #1e293b; }
    .budget-amounts { margin-bottom: 12px; }
    .consumed { font-size: 24px; font-weight: 700; color: #1e293b; }
    .separator { color: #94a3b8; margin: 0 8px; }
    .limit { color: #64748b; font-size: 18px; }
    .progress-bar { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
    .progress-fill { height: 100%; background: #8b5cf6; border-radius: 4px; }
    .progress-fill.exceeded { background: #ef4444; }
    .budget-footer { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; }
    .exceeded { color: #ef4444; font-weight: 600; }
    .exceeded-label { color: #ef4444; font-weight: 600; }
    .remaining { color: #10b981; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 4px; }
    .btn-icon:hover { background: #fef2f2; }
    .loading { text-align: center; padding: 48px; color: #64748b; }
    .empty { text-align: center; color: #94a3b8; padding: 48px 0; }
    @media (max-width: 768px) { .budgets-grid { grid-template-columns: 1fr; } }
  `]
})
export class BudgetsComponent implements OnInit {
  budgets: BudgetResponse[] = [];
  categories: CategoryResponse[] = [];
  showForm = false;
  loading = false;
  loadingList = true;

  months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  form: BudgetRequest = {
    limitAmount: 0,
    currency: 'PEN',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  };

  constructor(
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
    this.categoryService.getAll().subscribe({
      next: data => {
        this.categories = data;
        this.cdr.detectChanges();
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.cdr.detectChanges();
  }

  loadBudgets(): void {
    const now = new Date();
    this.budgetService.getByMonthAndYear(now.getMonth() + 1, now.getFullYear()).subscribe({
      next: data => {
        this.budgets = data;
        this.loadingList = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingList = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.budgetService.create(this.form).subscribe({
      next: () => {
        this.loadBudgets();
        this.showForm = false;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDelete(id: string): void {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    this.budgetService.delete(id).subscribe({
      next: () => {
        this.loadBudgets();
        this.cdr.detectChanges();
      }
    });
  }
}
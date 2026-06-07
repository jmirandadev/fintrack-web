import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavingGoalService } from '../../core/services/saving-goal.service';
import { SavingGoalResponse, SavingGoalRequest } from '../../core/models/saving-goal.model';

@Component({
  selector: 'app-saving-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>🏦 Metas de ahorro</h1>
        <button class="btn-primary" (click)="toggleForm()">
          {{ showForm ? '✕ Cancelar' : '+ Nueva meta' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <h3>Nueva meta de ahorro</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre</label>
              <input
                type="text"
                [(ngModel)]="form.name"
                name="name"
                required
                class="form-input"
                placeholder="Ej: Laptop nueva"
              />
            </div>
            <div class="form-group">
              <label>Monto objetivo</label>
              <input
                type="number"
                [(ngModel)]="form.targetAmount"
                name="targetAmount"
                required
                min="0.01"
                step="0.01"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Ahorro actual</label>
              <input
                type="number"
                [(ngModel)]="form.currentAmount"
                name="currentAmount"
                min="0"
                step="0.01"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Fecha límite</label>
              <input
                type="date"
                [(ngModel)]="form.targetDate"
                name="targetDate"
                class="form-input"
              />
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

      <div class="goals-grid" *ngIf="!loadingList">
        <div class="goal-card" *ngFor="let goal of goals">
          <div class="goal-header">
            <h3>{{ goal.name }}</h3>
            <span class="status-badge" [class.completed]="goal.status === 'COMPLETED'">
              {{ goal.status === 'COMPLETED' ? '✅ Completada' : '🔄 En progreso' }}
            </span>
          </div>
          <div class="goal-amounts">
            <span class="current"
              >{{ goal.currency }} {{ goal.currentAmount | number: '1.2-2' }}</span
            >
            <span class="separator">/</span>
            <span class="target">{{ goal.targetAmount | number: '1.2-2' }}</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              [style.width.%]="goal.progressPercentage > 100 ? 100 : goal.progressPercentage"
              [class.completed]="goal.status === 'COMPLETED'"
            ></div>
          </div>
          <div class="goal-footer">
            <span>{{ goal.progressPercentage | number: '1.0-0' }}% completado</span>
            <span class="remaining"
              >Resta: {{ goal.currency }} {{ goal.remainingAmount | number: '1.2-2' }}</span
            >
          </div>
          <p class="target-date" *ngIf="goal.targetDate">📅 Meta: {{ goal.targetDate }}</p>
          <div class="goal-actions">
            <button class="btn-add-saving" (click)="openAddSaving(goal)">+ Agregar ahorro</button>
            <button class="btn-edit" (click)="onEdit(goal)">✏️</button>
            <button class="btn-delete" (click)="onDelete(goal.id)">🗑️ Eliminar</button>
          </div>
        </div>
        <p *ngIf="goals.length === 0" class="empty">No hay metas de ahorro.</p>
      </div>
      <!-- Modal agregar ahorro -->
      <div class="modal-overlay" *ngIf="showAddModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>💰 Agregar ahorro</h3>
          <p class="modal-goal-name">{{ selectedGoal?.name }}</p>
          <div class="modal-progress">
            <span
              >{{ selectedGoal?.currency }}
              {{ selectedGoal?.currentAmount | number: '1.2-2' }}</span
            >
            <span class="modal-sep">/</span>
            <span>{{ selectedGoal?.targetAmount | number: '1.2-2' }}</span>
          </div>
          <div class="form-group">
            <label>Monto a agregar</label>
            <input
              type="number"
              [(ngModel)]="addAmount"
              name="addAmount"
              min="0.01"
              step="0.01"
              class="form-input"
              placeholder="0.00"
              autofocus
            />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
            <button
              class="btn-confirm"
              (click)="onAddSaving()"
              [disabled]="!addAmount || addAmount <= 0"
            >
              Agregar
            </button>
          </div>
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
        font-size: 28px;
        color: #1e293b;
      }
      .btn-primary {
        padding: 10px 20px;
        background: #0ea5e9;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      .btn-primary:hover:not(:disabled) {
        background: #0284c7;
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .form-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .form-card h3 {
        margin: 0 0 20px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
      }
      .form-input {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        box-sizing: border-box;
        outline: none;
      }
      .form-actions {
        margin-top: 8px;
      }
      .goals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }
      .goal-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #0ea5e9;
      }
      .goal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
      }
      .goal-header h3 {
        margin: 0;
        font-size: 16px;
        color: #1e293b;
      }
      .status-badge {
        font-size: 12px;
        background: #f0f9ff;
        color: #0284c7;
        padding: 4px 10px;
        border-radius: 20px;
      }
      .status-badge.completed {
        background: #f0fdf4;
        color: #166534;
      }
      .goal-amounts {
        margin-bottom: 12px;
      }
      .current {
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
      }
      .separator {
        color: #94a3b8;
        margin: 0 8px;
      }
      .target {
        color: #64748b;
        font-size: 18px;
      }
      .progress-bar {
        height: 8px;
        background: #f1f5f9;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 12px;
      }
      .progress-fill {
        height: 100%;
        background: #0ea5e9;
        border-radius: 4px;
      }
      .progress-fill.completed {
        background: #10b981;
      }
      .goal-footer {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #64748b;
        margin-bottom: 8px;
      }
      .remaining {
        color: #0ea5e9;
      }
      .target-date {
        font-size: 13px;
        color: #94a3b8;
        margin: 8px 0;
      }
      .btn-delete {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 13px;
        color: #ef4444;
        padding: 4px 8px;
        border-radius: 4px;
      }
      .btn-delete:hover {
        background: #fef2f2;
      }
      .loading {
        text-align: center;
        padding: 48px;
        color: #64748b;
      }
      .empty {
        text-align: center;
        color: #94a3b8;
        padding: 48px 0;
      }
      .goal-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      .btn-add-saving {
        flex: 1;
        padding: 8px;
        background: #eff6ff;
        color: #2563eb;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
      }
      .btn-add-saving:hover {
        background: #dbeafe;
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal {
        background: white;
        border-radius: 16px;
        padding: 28px;
        width: 100%;
        max-width: 380px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      }
      .modal h3 {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .modal-goal-name {
        color: #6b7280;
        font-size: 14px;
        margin-bottom: 16px;
      }
      .modal-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 20px;
        color: #111827;
      }
      .modal-sep {
        color: #9ca3af;
      }
      .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }
      .btn-cancel {
        flex: 1;
        padding: 10px;
        background: #f1f5f9;
        color: #64748b;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .btn-cancel:hover {
        background: #e2e8f0;
      }
      .btn-confirm {
        flex: 1;
        padding: 10px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .btn-confirm:hover:not(:disabled) {
        background: #1d4ed8;
      }
      .btn-confirm:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-edit {
        padding: 8px 10px;
        background: #f0fdf4;
        color: #059669;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-edit:hover {
        background: #dcfce7;
      }
    `,
  ],
})
export class SavingGoalsComponent implements OnInit {
  goals: SavingGoalResponse[] = [];
  showForm = false;
  loading = false;
  loadingList = true;
  showAddModal = false;
  selectedGoal: SavingGoalResponse | null = null;
  addAmount: number = 0;
  editingId: string | null = null;
  form: SavingGoalRequest = {
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    currency: 'PEN',
  };

  constructor(
    private savingGoalService: SavingGoalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.cdr.detectChanges();
  }

  loadGoals(): void {
    this.savingGoalService.getAll().subscribe({
      next: (data) => {
        this.goals = data;
        this.loadingList = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingList = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit(): void {
    this.loading = true;
    const obs = this.editingId
      ? this.savingGoalService.update(this.editingId, this.form)
      : this.savingGoalService.create(this.form);

    obs.subscribe({
      next: () => {
        this.loadGoals();
        this.showForm = false;
        this.editingId = null;
        this.loading = false;
        this.form = { name: '', targetAmount: 0, currentAmount: 0, currency: 'PEN' };
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onDelete(id: string): void {
    if (!confirm('¿Eliminar esta meta?')) return;
    this.savingGoalService.delete(id).subscribe({
      next: () => {
        this.loadGoals();
        this.cdr.detectChanges();
      },
    });
  }
  openAddSaving(goal: SavingGoalResponse): void {
    this.selectedGoal = goal;
    this.addAmount = 0;
    this.showAddModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showAddModal = false;
    this.selectedGoal = null;
    this.cdr.detectChanges();
  }

  onAddSaving(): void {
    if (!this.selectedGoal || !this.addAmount || this.addAmount <= 0) return;

    const newAmount = Number(this.selectedGoal.currentAmount) + Number(this.addAmount);

    const request: SavingGoalRequest = {
      name: this.selectedGoal.name,
      targetAmount: this.selectedGoal.targetAmount,
      currentAmount: newAmount,
      currency: this.selectedGoal.currency,
      targetDate: this.selectedGoal.targetDate,
    };

    this.savingGoalService.update(this.selectedGoal.id, request).subscribe({
      next: () => {
        this.closeModal();
        this.loadGoals();
        this.cdr.detectChanges();
      },
    });
  }
  onEdit(goal: SavingGoalResponse): void {
    this.form = {
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      currency: goal.currency,
      targetDate: goal.targetDate,
    };
    this.editingId = goal.id;
    this.showForm = true;
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { CategoryResponse, CategoryRequest } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>🏷️ Categorías</h1>
        <button class="btn-primary" (click)="toggleForm()">
          {{ showForm ? '✕ Cancelar' : '+ Nueva categoría' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showForm">
        <h3>Nueva categoría</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="form.name" name="name"
                required class="form-input" placeholder="Ej: Videojuegos"/>
            </div>
            <div class="form-group">
              <label>Color</label>
              <input type="color" [(ngModel)]="form.color" name="color" class="form-input color-input"/>
            </div>
            <div class="form-group">
              <label>Ícono</label>
              <input type="text" [(ngModel)]="form.icon" name="icon"
                class="form-input" placeholder="Ej: gamepad"/>
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

      <div class="categories-grid" *ngIf="!loadingList">
        <div class="category-card" *ngFor="let cat of categories">
          <div class="category-color" [style.background]="cat.color"></div>
          <div class="category-info">
            <span class="category-name">{{ cat.name }}</span>
            <span class="global-badge" *ngIf="cat.global">Global</span>
            <span class="custom-badge" *ngIf="!cat.global">Personalizada</span>
          </div>
          <div class="category-actions" *ngIf="!cat.global">
            <button class="btn-icon danger" (click)="onDelete(cat.id)">🗑️</button>
          </div>
        </div>
        <p *ngIf="categories.length === 0" class="empty">No hay categorías.</p>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 28px; color: #1e293b; }
    .btn-primary { padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #d97706; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .form-card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .form-card h3 { margin: 0 0 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; }
    .color-input { padding: 4px; height: 42px; cursor: pointer; }
    .form-actions { margin-top: 8px; }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
    .category-card { background: white; border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .category-color { width: 16px; height: 40px; border-radius: 4px; flex-shrink: 0; }
    .category-info { flex: 1; }
    .category-name { display: block; font-weight: 600; color: #1e293b; }
    .global-badge { font-size: 11px; background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 10px; }
    .custom-badge { font-size: 11px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; }
    .btn-icon:hover { background: #fef2f2; }
    .loading { text-align: center; padding: 48px; color: #64748b; }
    .empty { text-align: center; color: #94a3b8; padding: 48px 0; }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: CategoryResponse[] = [];
  showForm = false;
  loading = false;
  loadingList = true;

  form: CategoryRequest = { name: '', icon: 'tag', color: '#6366f1' };

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.cdr.detectChanges();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: data => {
        this.categories = data;
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
    this.categoryService.create(this.form).subscribe({
      next: () => {
        this.loadCategories();
        this.showForm = false;
        this.loading = false;
        this.form = { name: '', icon: 'tag', color: '#6366f1' };
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDelete(id: string): void {
    if (!confirm('¿Eliminar esta categoría?')) return;
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.loadCategories();
        this.cdr.detectChanges();
      }
    });
  }
}
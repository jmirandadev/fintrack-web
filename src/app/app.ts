import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="layout">
      <aside class="sidebar" *ngIf="authService.isAuthenticated()">
        <div class="sidebar-brand">
          <div class="brand-icon">💰</div>
          <div>
            <h2>FinTrack</h2>
            <span>Finanzas personales</span>
          </div>
        </div>

        <div class="user-pill">
          <div class="user-avatar">{{ getInitial() }}</div>
          <div class="user-info">
            <p class="user-name">{{ authService.getCurrentUser()?.firstName }} {{ authService.getCurrentUser()?.lastName }}</p>
            <p class="user-email">{{ authService.getCurrentUser()?.email }}</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          <p class="nav-section-label">Principal</p>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/expenses" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💸</span>
            <span>Gastos</span>
          </a>
          <a routerLink="/incomes" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💵</span>
            <span>Ingresos</span>
          </a>

          <p class="nav-section-label">Planificación</p>
          <a routerLink="/budgets" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🎯</span>
            <span>Presupuestos</span>
          </a>
          <a routerLink="/saving-goals" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏦</span>
            <span>Metas de ahorro</span>
          </a>

          <p class="nav-section-label">Configuración</p>
          <a routerLink="/categories" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏷️</span>
            <span>Categorías</span>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📈</span>
            <span>Reportes</span>
          </a>
        </nav>

        <button class="logout-btn" (click)="logout()">
          <span>🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <main class="main" [class.full]="!authService.isAuthenticated()">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      min-height: 100vh;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0; top: 0; bottom: 0;
      z-index: 100;
      overflow-y: auto;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .sidebar-brand h2 {
      font-size: 17px;
      font-weight: 800;
      color: white;
      letter-spacing: -0.3px;
    }

    .sidebar-brand span {
      font-size: 11px;
      color: #64748b;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 16px 12px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.04);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 11px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-nav {
      flex: 1;
      padding: 8px 12px;
    }

    .nav-section-label {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 16px 8px 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s;
      margin-bottom: 2px;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
    }

    .nav-item.active {
      background: rgba(37,99,235,0.2);
      color: #60a5fa;
      font-weight: 600;
    }

    .nav-icon { font-size: 16px; width: 20px; text-align: center; }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px;
      padding: 10px 14px;
      background: rgba(220,38,38,0.1);
      color: #f87171;
      border: 1px solid rgba(220,38,38,0.2);
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      transition: all 0.15s;
      width: calc(100% - 24px);
    }

    .logout-btn:hover {
      background: rgba(220,38,38,0.2);
      color: #fca5a5;
    }

    .main {
      margin-left: 260px;
      flex: 1;
      padding: 28px 32px;
      min-height: 100vh;
    }

    .main.full {
      margin-left: 0;
      padding: 0;
    }

    @media (max-width: 1024px) {
      .sidebar { width: 220px; }
      .main { margin-left: 220px; padding: 20px; }
    }

    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); width: 260px; }
      .main { margin-left: 0; padding: 16px; }
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {}

  getInitial(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.firstName.charAt(0).toUpperCase() : '?';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
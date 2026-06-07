import { ExpenseResponse } from './expense.model';
import { BudgetResponse } from './budget.model';

export interface DashboardResponse {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
  currency: string;
  month: number;
  year: number;
  recentExpenses: ExpenseResponse[];
  budgets: BudgetResponse[];
}
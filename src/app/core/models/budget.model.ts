export interface BudgetRequest {
  limitAmount: number;
  currency: string;
  month: number;
  year: number;
  categoryId?: string;
}

export interface BudgetResponse {
  id: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  consumed: number;
  remaining: number;
  percentageUsed: number;
  currency: string;
  month: number;
  year: number;
  exceeded: boolean;
}
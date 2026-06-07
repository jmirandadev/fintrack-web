export interface ExpenseRequest {
  amount: number;
  currency: string;
  expenseDate: string;
  description: string;
  notes?: string;
  categoryId: string;
  paymentMethodId: string;
}

export interface ExpenseResponse {
  id: string;
  amount: number;
  currency: string;
  expenseDate: string;
  description: string;
  notes?: string;
  categoryId: string;
  categoryName: string;
  paymentMethodId: string;
  paymentMethodName: string;
  createdAt: string;
  updatedAt: string;
}
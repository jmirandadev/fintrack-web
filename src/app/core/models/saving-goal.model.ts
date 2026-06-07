export interface SavingGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: string;
}

export interface SavingGoalResponse {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  currency: string;
  targetDate?: string;
  status: string;
  createdAt: string;
}
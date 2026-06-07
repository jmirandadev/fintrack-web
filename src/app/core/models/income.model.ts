export interface IncomeRequest {
  amount: number;
  currency: string;
  incomeDate: string;
  description: string;
  sourceType: string;
}

export interface IncomeResponse {
  id: string;
  amount: number;
  currency: string;
  sourceType: string;
  incomeDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const INCOME_SOURCES = [
  { value: 'SALARY', label: 'Salario' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INVESTMENT', label: 'Inversión' },
  { value: 'BUSINESS', label: 'Negocio' },
  { value: 'GIFT', label: 'Regalo' },
  { value: 'OTHER', label: 'Otro' }
];
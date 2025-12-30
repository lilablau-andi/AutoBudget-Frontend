export type Category = {
  id: number;
  name: string;
  type: string;
  created_at: string;
};

export type Expense = {
  id: number;
  amount: number;
  category_id: number | null;
  category: Category | null;
  type: string;
  expense_date: string;
  description?: string;
};
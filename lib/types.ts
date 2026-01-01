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

export type ImportedTransaction = {
  expense_date: string;
  amount: number;
  description: string;
  type: "expense" | "income";
  category_id?: number | null;
};

export type ImportPreviewResponse = {
  transactions: ImportedTransaction[];
  errors: string[];
  headers_found: string[];
};



export type PaginationMeta = {
  total_count: number;
  total_pages: number;
  page: number;
  page_size: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type CategoryAnalyticsData = {
  date: string;
  sum: number;
  category_name: string;
};
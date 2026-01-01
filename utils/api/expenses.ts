import { PaginatedResponse, Expense, ImportedTransaction, ImportPreviewResponse } from "@/lib/types";

const API_BASE_URL = "http://localhost:8000/api/v1"

export async function getExpenses(
  token: string,
  startDate?: string,
  endDate?: string,
  categoryIds?: number[],
  type?: "expense" | "income",
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<Expense>> {
  const url = new URL(`${API_BASE_URL}/expenses`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("page_size", pageSize.toString());

  if (type) {
    url.searchParams.append("type", type);
  }
  if (startDate) {
    url.searchParams.append("start_date", startDate);
  }
  if (endDate) {
    url.searchParams.append("end_date", endDate);
  }
  if (categoryIds && categoryIds.length > 0) {
    categoryIds.forEach(id => {
      url.searchParams.append("category_ids", id.toString());
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return res.json();
}

export async function createExpense(
  token: string,
  expense: FormData | {
    amount: number
    type: "expense" | "income"
    category_id: number
    expense_date: string
    description?: string
  }
) {
  const isFormData = expense instanceof FormData;
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? expense : JSON.stringify(expense),
  })


  if (!res.ok) {
    throw new Error("Failed to create expense")
  }

  return res.json()
}

export async function editExpense(
  token: string,
  id: number,
  expense: {
    amount: number
    type: "expense" | "income"
    category_id: number
    description?: string
    expense_date: string
  }
) {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expense),
  })

  if (!res.ok) {
    throw new Error("Failed to update expense")
  }

  return res.json()
}

export async function deleteExpense(token: string, id: number) {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to delete expense")
  }
}

export async function patchExpense(
  token: string,
  id: number,
  data: FormData | Partial<Expense>
) {
  const isFormData = data instanceof FormData;
  
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? data : JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to patch expense")
  }

  return res.json()
}

export async function getImportPreview(token: string, file: File): Promise<ImportPreviewResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/expenses/import/preview`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to get import preview");
  }

  return res.json();
}

export async function saveImportBatch(token: string, transactions: ImportedTransaction[]) {
  const res = await fetch(`${API_BASE_URL}/expenses/import/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactions }),
  });

  if (!res.ok) {
    throw new Error("Failed to save import batch");
  }

  return res.json();
}
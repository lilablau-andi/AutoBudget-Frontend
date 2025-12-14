const API_BASE_URL = "http://localhost:8000/api/v1"

export async function getExpenses(token: string) {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch expenses")
  }

  return res.json()
}

export async function createExpense(
  token: string,
  expense: {
    amount: number
    type: "expense" | "income"
    category: string
    expense_date: string
    description?: string
  }
) {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expense),
  })

  if (!res.ok) {
    throw new Error("Failed to create expense")
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
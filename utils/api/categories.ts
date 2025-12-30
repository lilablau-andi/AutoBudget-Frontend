const API_BASE_URL = "http://localhost:8000/api/v1"

export type CategoryType = "expense" | "income"

export interface Category {
  id: number
  name: string
  type: CategoryType
  created_at: string
}

export async function getCategories(token: string): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch categories")
  }

  return res.json()
}

export async function createCategory(
  token: string,
  category: {
    name: string
    type: CategoryType
  }
) {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  })

  if (!res.ok) {
    throw new Error("Failed to create category")
  }

  return res.json()
}

export async function updateCategory(
  token: string,
  id: number,
  category: {
    name: string
    type: CategoryType
  }
) {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  })

  if (!res.ok) {
    throw new Error("Failed to update category")
  }

  return res.json()
}

export async function deleteCategory(token: string, id: number) {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to delete category")
  }
}

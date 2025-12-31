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
  category: FormData | {
    name: string
    type: CategoryType
  }
) {
  const isFormData = category instanceof FormData;
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? category : JSON.stringify(category),
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

export async function patchCategory(
  token: string,
  id: number,
  data: FormData | Partial<Category>
) {
  const isFormData = data instanceof FormData;
  
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? data : JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to patch category")
  }

  return res.json()
}


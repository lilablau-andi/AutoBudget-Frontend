"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { getExpenses, deleteExpense } from "@/utils/api"

type Expense = {
  id: number
  amount: number
  category: string
  type: string
  expense_date: string
}

export default function ExpensesPage() {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadExpenses = async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) return

      const expenses = await getExpenses(token)
      setExpenses(expenses)
      setLoading(false)
    }

    loadExpenses()
  }, [])

  const handleDelete = async (id: number) => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) return

    await deleteExpense(token, id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  if (loading) return <p>Lade...</p>

  return (
    <div>
      <h1>Meine Ausgaben</h1>

      <ul>
        {expenses.map((e) => (
          <li key={e.id}>
            {e.category} – {e.amount} €
            <button onClick={() => handleDelete(e.id)}>Löschen</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

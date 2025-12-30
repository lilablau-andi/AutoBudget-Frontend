"use client";

import { SetHeaderTitle } from "@/components/app/header-context";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getExpenses } from "@/utils/api/expenses";
import { Expense } from "@/lib/types";
import AddExpenseDialog from "@/components/expenses/add-expense-dialog";

export default function AllExpensesPage() {
  const supabase = createClient();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) return;

    try {
      const expenses = await getExpenses(token);
      setExpenses(expenses);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  if (loading) {
    return <div className="p-4">Lade Ausgaben...</div>;
  }

  return (
    <div>
      <SetHeaderTitle
        title="Alle Ausgaben"
        action={<AddExpenseDialog onExpenseAdded={loadExpenses} />}
      />
      <ExpensesTable
        data={expenses}
        onExpenseDeleted={loadExpenses}
        onExpenseUpdated={loadExpenses}
      />
    </div>
  );
}

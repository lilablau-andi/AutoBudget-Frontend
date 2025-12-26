"use client";

import { SetHeaderTitle } from "@/components/app/header-context";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getExpenses } from "@/utils/api/expenses";
import { Expense } from "@/components/expenses/types";

export default function AllExpensesPage() {
  const supabase = createClient();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadExpenses();
  }, []);

  if (loading) {
    return <div className="p-4">Lade Ausgaben...</div>;
  }

  return (
    <div>
      <SetHeaderTitle title="Alle Ausgaben" />
      <ExpensesTable data={expenses} />
    </div>
  );
}

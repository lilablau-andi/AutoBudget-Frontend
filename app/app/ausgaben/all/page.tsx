"use client";

import { SetHeaderTitle } from "@/components/app/header-context";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getExpenses } from "@/utils/api/expenses";
import { Expense, Category, PaginationMeta } from "@/lib/types";
import AddExpenseDialog from "@/components/expenses/add-expense-dialog";
import { subDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { getCategories } from "@/utils/api/categories";

export default function AllExpensesPage() {
  const supabase = createClient();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const loadExpenses = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) return;

    try {
      const start = dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined;
      const end = dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : undefined;
      const response = await getExpenses(
        token,
        start,
        end,
        selectedCategoryIds,
        page,
        pageSize
      );
      setExpenses(response.items);
      setPagination(response.meta);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    try {
      const cats = await getCategories(token);
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [dateRange, selectedCategoryIds, page, pageSize]);

  return (
    <div>
      <SetHeaderTitle
        title="Alle Ausgaben"
        action={<AddExpenseDialog onExpenseAdded={loadExpenses} />}
      />
      <ExpensesTable
        data={expenses}
        loading={loading}
        dateRange={dateRange}
        onDateRangeChange={(range) => {
          setDateRange(range);
          setPage(1);
        }}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryIdsChange={(ids) => {
          setSelectedCategoryIds(ids);
          setPage(1);
        }}
        onExpenseDeleted={loadExpenses}
        onExpenseUpdated={loadExpenses}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
}

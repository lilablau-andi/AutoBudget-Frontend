"use client";

import { useEffect, useState } from "react";
import { Expense, Category } from "../../lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/utils/api/categories";
import { editExpense } from "@/utils/api/expenses";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Tag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface CategoryCellProps {
  expense: Expense;
  onExpenseUpdated?: () => void;
}

export function CategoryCell({ expense, onExpenseUpdated }: CategoryCellProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  const loadCategories = async () => {
    if (categories.length > 0) return;

    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      const fetchedCategories = await getCategories(token);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId: number) => {
    setIsUpdating(true);

    const updateAction = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Nicht authentifiziert");

      await editExpense(token, expense.id, {
        amount: expense.amount,
        type: expense.type as "expense" | "income",
        category_id: categoryId,
        description: expense.description,
        expense_date: expense.expense_date,
      });

      if (onExpenseUpdated) {
        onExpenseUpdated();
      }
    };

    try {
      await toast.promise(updateAction(), {
        loading: "Kategorie wird zugewiesen...",
        success: "Kategorie erfolgreich zugewiesen",
        error: "Fehler beim Zuweisen der Kategorie",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && loadCategories()}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={`h-auto p-0 font-normal hover:bg-transparent flex items-center gap-2 ${
              !expense.category
                ? "text-muted-foreground italic"
                : "text-foreground"
            }`}
            disabled={isUpdating}
          >
            {!expense.category ? (
              "... Kategorie zuweisen"
            ) : (
              <>
                <HugeiconsIcon
                  icon={Tag01Icon}
                  className="h-3 w-3 opacity-50"
                />
                {expense.category.name}
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-56">
        {loading ? (
          <div className="p-2 text-sm text-muted-foreground">
            Lade Kategorien...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground">
            Keine Kategorien gefunden
          </div>
        ) : (
          categories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={
                expense.category?.id === category.id ? "bg-accent" : ""
              }
            >
              {category.name}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

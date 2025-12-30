import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { editExpense } from "@/utils/api/expenses";
import { Expense } from "@/lib/types";
import { toast } from "sonner";

interface EditExpenseDialogProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseUpdated?: () => void;
}

export default function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
  onExpenseUpdated,
}: EditExpenseDialogProps) {
  const [formData, setFormData] = useState({
    description: expense.description || "",
    amount: expense.amount.toString(),
    date: expense.expense_date.split("T")[0],
    categoryId: expense.category_id?.toString() || "",
  });
  const [loading, setLoading] = useState(false);

  // Sync state if expense changes
  useEffect(() => {
    setFormData({
      description: expense.description || "",
      amount: expense.amount.toString(),
      date: expense.expense_date.split("T")[0],
      categoryId: expense.category_id?.toString() || "",
    });
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updateAction = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error("Nicht authentifiziert");
      }

      await editExpense(token, expense.id, {
        amount: parseFloat(formData.amount),
        description: formData.description,
        expense_date: formData.date,
        category_id: isNaN(parseInt(formData.categoryId))
          ? 1
          : parseInt(formData.categoryId),
        type: "expense",
      });

      if (onExpenseUpdated) {
        onExpenseUpdated();
      }
      onOpenChange(false);
      return { description: formData.description || "Ausgabe" };
    };

    try {
      await toast.promise(updateAction(), {
        loading: "Wird gespeichert...",
        success: (data) => `${data.description} wurde aktualisiert`,
        error: "Fehler beim Aktualisieren der Ausgabe",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-56">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ausgabe bearbeiten</DialogTitle>
            <DialogDescription>
              Ändere hier Deine Ausgabe. Drücke 'speichern', um die Änderungen
              zu übernehmen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                name="description"
                placeholder="z.B. Wocheneinkauf"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Betrag (€)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryId">Kategorie ID</Label>
              <Input
                id="categoryId"
                name="categoryId"
                type="number"
                placeholder="ID eingeben"
                value={formData.categoryId}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Abbrechen
                </Button>
              }
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { patchExpense } from "@/utils/api/expenses";

import { Expense } from "@/lib/types";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";
import { format, parse } from "date-fns";
import { CategorySelect } from "./category-select";

interface EditExpenseDialogProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseUpdated?: () => void;
}

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return format(date, "dd.MM.yyyy", { locale: de });
}

function isValidDate(date: Date | undefined) {
  return date instanceof Date && !isNaN(date.getTime());
}

export default function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
  onExpenseUpdated,
}: EditExpenseDialogProps) {
  const [formData, setFormData] = useState({
    description: expense.description || "",
    amount: expense.amount.toString().replace(".", ","),
    date: expense.expense_date.split("T")[0],
    categoryId: expense.category_id?.toString() || "",
  });
  const [dateValue, setDateValue] = useState(
    formatDate(new Date(expense.expense_date))
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state if expense changes
  useEffect(() => {
    setFormData({
      description: expense.description || "",
      amount: expense.amount.toString().replace(".", ","),
      date: expense.expense_date.split("T")[0],
      categoryId: expense.category_id?.toString() || "",
    });
    setDateValue(formatDate(new Date(expense.expense_date)));
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

      await patchExpense(token, expense.id, {
        amount: parseFloat(formData.amount.replace(",", ".")),
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ausgabe bearbeiten</DialogTitle>
            <DialogDescription>
              Ändere hier Deine Ausgabe. Drücke &apos;speichern&apos;, um die
              Änderungen zu übernehmen.
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
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  pattern="^[0-9]+([,.][0-9]{0,2})?$"
                  onInvalid={(e) =>
                    (e.target as HTMLInputElement).setCustomValidity(
                      "Bitte geben Sie einen gültigen Betrag ein (z.B. 12,34)"
                    )
                  }
                  onInput={(e) =>
                    (e.target as HTMLInputElement).setCustomValidity("")
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Datum</Label>
                <div className="relative flex gap-2">
                  <Input
                    id="date"
                    value={dateValue}
                    placeholder={formatDate(new Date())}
                    className="bg-background pr-10"
                    onChange={(e) => {
                      setDateValue(e.target.value);
                      // Try to parse German format
                      try {
                        const parsedDate = parse(
                          e.target.value,
                          "dd.MM.yyyy",
                          new Date(),
                          { locale: de }
                        );
                        if (isValidDate(parsedDate)) {
                          setFormData((prev) => ({
                            ...prev,
                            date: parsedDate.toISOString().split("T")[0],
                          }));
                        }
                      } catch {
                        // Ignore parse errors while typing
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setCalendarOpen(true);
                      }
                    }}
                    required
                  />
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          id="date-picker"
                          variant="ghost"
                          type="button"
                          className="absolute top-1/2 right-2 size-6 -translate-y-1/2 p-0"
                        >
                          <CalendarIcon className="size-3.5" />
                          <span className="sr-only">Datum auswählen</span>
                        </Button>
                      }
                    />
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="end"
                      alignOffset={-8}
                      sideOffset={10}
                    >
                      <Calendar
                        mode="single"
                        selected={new Date(formData.date)}
                        onSelect={(date) => {
                          if (date) {
                            setFormData((prev) => ({
                              ...prev,
                              date: date.toISOString().split("T")[0],
                            }));
                            setDateValue(formatDate(date));
                            setCalendarOpen(false);
                          }
                        }}
                        locale={de}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryId">Kategorie</Label>
              <CategorySelect
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryId: value }))
                }
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

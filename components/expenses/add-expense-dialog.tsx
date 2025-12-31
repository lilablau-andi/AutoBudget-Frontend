import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { createExpense } from "@/utils/api/expenses";
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

interface AddExpenseDialogProps {
  onExpenseAdded?: () => void;
}

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return format(date, "dd.MM.yyyy", { locale: de });
}

function isValidDate(date: Date | undefined) {
  return date instanceof Date && !isNaN(date.getTime());
}

export default function AddExpenseDialog({
  onExpenseAdded,
}: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
  });
  const [dateValue, setDateValue] = useState(formatDate(new Date()));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error("Nicht authentifiziert");
      }

      await createExpense(token, {
        amount: parseFloat(formData.amount.replace(",", ".")),
        description: formData.description,
        expense_date: formData.date,
        category_id: isNaN(parseInt(formData.categoryId))
          ? 1
          : parseInt(formData.categoryId),
        type: "expense",
      });

      setOpen(false);
      // Reset form
      setFormData({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
      });
      setDateValue(formatDate(new Date()));

      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (error) {
      console.error("Fehler beim Erstellen der Ausgabe:", error);
      // Here you might want to set an error state to display to the user
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <HugeiconsIcon icon={Plus} />
            Ausgabe hinzufügen
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ausgabe hinzufügen</DialogTitle>
            <DialogDescription>
              Füge hier Deine Ausgabe hinzu. Drücke 'speichern', um Deine
              Ausgabe hinzuzufügen.
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
            {/* 
              TODO: Replace with a proper Category Select component when the categories API is available. 
              Currently using a simple ID input or defaulting if left empty in logic.
            */}
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

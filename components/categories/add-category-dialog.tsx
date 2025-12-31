"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { createCategory, CategoryType } from "@/utils/api/categories";
import { toast } from "sonner";

interface AddCategoryDialogProps {
  onCategoryAdded?: () => void;
}

export default function AddCategoryDialog({
  onCategoryAdded,
}: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as CategoryType,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const createAction = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error("Nicht authentifiziert");
      }

      await createCategory(token, {
        name: formData.name,
        type: formData.type,
      });

      setOpen(false);
      setFormData({
        name: "",
        type: "expense",
      });

      if (onCategoryAdded) {
        onCategoryAdded();
      }
      return { name: formData.name };
    };

    try {
      await toast.promise(createAction(), {
        loading: "Wird gespeichert...",
        success: (data) => `Kategorie "${data.name}" wurde erstellt`,
        error: "Fehler beim Erstellen der Kategorie",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <HugeiconsIcon icon={Plus} />
            Kategorie hinzufügen
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Kategorie hinzufügen</DialogTitle>
            <DialogDescription>
              Füge hier eine neue Kategorie hinzu. Drücke 'speichern', um die
              Kategorie zu erstellen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="z.B. Lebensmittel"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Typ</Label>
              <Select
                value={formData.type === "expense" ? "Ausgabe" : "Einnahme"}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    type: value === "Ausgabe" ? "expense" : "income",
                  }));
                }}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ausgabe">Ausgabe</SelectItem>
                  <SelectItem value="Einnahme">Einnahme</SelectItem>
                </SelectContent>
              </Select>
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

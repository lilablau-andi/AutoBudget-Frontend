"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { Category, patchCategory, CategoryType } from "@/utils/api/categories";

import { toast } from "sonner";

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryUpdated?: () => void;
}

export default function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  onCategoryUpdated,
}: EditCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: category.name,
    type: category.type as CategoryType,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: category.name,
      type: category.type as CategoryType,
    });
  }, [category]);

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

      await patchCategory(token, category.id, {
        name: formData.name,
        type: formData.type,
      });

      if (onCategoryUpdated) {
        onCategoryUpdated();
      }
      onOpenChange(false);
      return { name: formData.name };
    };

    try {
      await toast.promise(updateAction(), {
        loading: "Wird gespeichert...",
        success: (data) => `Kategorie "${data.name}" wurde aktualisiert`,
        error: "Fehler beim Aktualisieren der Kategorie",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Kategorie bearbeiten</DialogTitle>
            <DialogDescription>
              Ändere hier Deine Kategorie. Drücke 'speichern', um die Änderungen
              zu übernehmen.
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

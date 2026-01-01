"use client";

import { useEffect, useState } from "react";
import { Category } from "@/lib/types";
import { getCategories } from "@/utils/api/categories";
import { createClient } from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  type?: "expense" | "income";
  categories?: Category[];
  placeholder?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  type = "expense",
  categories: preloadedCategories,
  placeholder,
}: CategorySelectProps) {
  const [internalCategories, setInternalCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const categoriesToUse = preloadedCategories || internalCategories;
  const filteredCategories = categoriesToUse.filter((c) => c.type === type);

  useEffect(() => {
    if (preloadedCategories) return;

    const loadCategories = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;

        const fetchedCategories = await getCategories(token);
        setInternalCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [supabase.auth, preloadedCategories]);

  const selectedCategory = categoriesToUse.find(
    (c) => c.id.toString() === value
  );

  return (
    <Select value={value} onValueChange={(val) => val && onValueChange(val)}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            placeholder || (loading ? "Lade Kategorien..." : "Kategorie wählen")
          }
        >
          {selectedCategory && (
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Tag01Icon} className="h-3 w-3 opacity-50" />
              {selectedCategory.name}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {filteredCategories.length === 0 && !loading ? (
          <div className="p-2 text-sm text-muted-foreground text-center">
            Keine Kategorien gefunden
          </div>
        ) : (
          filteredCategories.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              <HugeiconsIcon icon={Tag01Icon} className="h-3 w-3 opacity-50" />
              {category.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

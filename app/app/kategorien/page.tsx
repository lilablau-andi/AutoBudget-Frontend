"use client";

import { SetHeaderTitle } from "@/components/app/header-context";
import { CategoriesTable } from "@/components/categories/categories-table";
import AddCategoryDialog from "@/components/categories/add-category-dialog";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCategories, Category } from "@/utils/api/categories";

export default function Kategorien() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) return;

    try {
      const categories = await getCategories(token);
      setCategories(categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) {
    return <div className="p-4">Lade Kategorien...</div>;
  }

  return (
    <div>
      <SetHeaderTitle
        title="Kategorien"
        action={<AddCategoryDialog onCategoryAdded={loadCategories} />}
      />
      <CategoriesTable
        data={categories}
        onCategoryDeleted={loadCategories}
        onCategoryUpdated={loadCategories}
      />
    </div>
  );
}

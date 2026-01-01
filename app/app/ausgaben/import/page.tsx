"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { saveImportBatch } from "@/utils/api/expenses";
import { getCategories } from "@/utils/api/categories";
import { ImportedTransaction, Category } from "@/lib/types";
import { SetHeaderTitle } from "@/components/app/header-context";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { FloppyDiskIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import {
  ImportPreviewTable,
  ImportRow,
} from "@/components/expenses/import-preview-table";

export default function ImportPreviewPage() {
  const [transactions, setTransactions] = useState<ImportRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load data from session storage
    const data = sessionStorage.getItem("import_preview_data");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log("Parsed session storage data:", parsed);

        let loadedTransactions: ImportedTransaction[] = [];

        if (parsed && Array.isArray(parsed.transactions)) {
          // New format
          loadedTransactions = parsed.transactions;
          setImportErrors(parsed.errors || []);
        } else if (Array.isArray(parsed)) {
          // Old format fallback
          loadedTransactions = parsed;
        } else if (parsed && Array.isArray(parsed.data)) {
          // Potential other wrapper
          loadedTransactions = parsed.data;
        } else {
          console.error("Unexpected import data format", parsed);
          toast.error("Format der Import-Daten ungültig");
          setTransactions([]);
        }

        // Add temporary IDs for the table (needed for reliable selection/updates)
        if (loadedTransactions.length > 0) {
          const withIds = loadedTransactions.map((t) => ({
            ...t,
            _id: crypto.randomUUID(),
          }));
          setTransactions(withIds);
        }
      } catch (e) {
        console.error("Failed to parse import data", e);
        toast.error("Fehler beim Laden der Vorschau");
      }
    }

    const loadCategories = async () => {
      const supabase = createClient();
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

    loadCategories();
    setLoading(false);
  }, [router]);

  const handleUpdate = (
    id: string,
    field: keyof ImportedTransaction,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    setTransactions((prev) =>
      prev.map((t) => (t._id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  const handleBulkDelete = (ids: string[]) => {
    setTransactions((prev) => prev.filter((t) => !ids.includes(t._id)));
    toast.success(`${ids.length} Transaktionen gelöscht`);
  };

  const handleBulkUpdate = (
    ids: string[],
    field: keyof ImportedTransaction,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    setTransactions((prev) =>
      prev.map((t) => (ids.includes(t._id) ? { ...t, [field]: value } : t))
    );
    toast.success(`${ids.length} Transaktionen aktualisiert`);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      toast.error("Nicht authentifiziert");
      setSaving(false);
      return;
    }

    try {
      // Clean up _id before sending
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cleanTransactions = transactions.map(({ _id, ...rest }) => rest);

      await saveImportBatch(token, cleanTransactions);
      toast.success(`${transactions.length} Einträge erfolgreich importiert`);
      sessionStorage.removeItem("import_preview_data");
      router.push("/app/ausgaben/all");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Speichern des Imports");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Lade Vorschau...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <SetHeaderTitle
        title="Import Vorschau"
        action={
          <Button
            onClick={handleSave}
            disabled={
              saving ||
              !Array.isArray(transactions) ||
              transactions.length === 0
            }
          >
            {saving ? "Speichert..." : "Import Speichern"}
            <HugeiconsIcon icon={FloppyDiskIcon} className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      {importErrors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4">
          <div className="flex items-center gap-2 text-destructive font-medium mb-2">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5" />
            {importErrors.length} Fehler beim Importieren gefunden
          </div>
          <ul className="list-disc list-inside text-sm text-destructive/80 space-y-1 max-h-40 overflow-y-auto">
            {importErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-md">
        <ImportPreviewTable
          data={transactions}
          categories={categories}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onBulkUpdate={handleBulkUpdate}
        />
      </div>
    </div>
  );
}

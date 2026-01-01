"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { getImportPreview } from "@/utils/api/expenses";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FileUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function ImportCSVDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Bitte wähle eine Datei aus");
      return;
    }

    setLoading(true);

    const performImport = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) throw new Error("Nicht authentifiziert");

      const previewData = await getImportPreview(token, file);
      console.log("Preview Data received from backend:", previewData);

      // Store data in sessionStorage for the preview page
      sessionStorage.setItem(
        "import_preview_data",
        JSON.stringify(previewData)
      );

      setOpen(false);
      router.push("/app/ausgaben/import"); // User suggested path
      return previewData;
    };

    try {
      await toast.promise(performImport(), {
        loading: "CSV wird analysiert...",
        success: "Vorschau erstellt - leite weiter zur Überprüfung",
        error: "Fehler beim Importieren der CSV",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2">
            <HugeiconsIcon icon={FileUploadIcon} className="h-4 w-4" />
            CSV Import
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ausgaben importieren</DialogTitle>
            <DialogDescription>
              Lade hier deine CSV-Datei hoch. Wir erstellen eine Vorschau, damit
              du die Daten vor dem Speichern prüfen kannst.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">CSV Datei</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Analysiere..." : "Vorschau erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

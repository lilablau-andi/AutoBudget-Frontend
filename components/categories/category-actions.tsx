"use client";

import { useState } from "react";
import { Row, Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Category, deleteCategory } from "@/utils/api/categories";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import EditCategoryDialog from "./edit-category-dialog";

interface CategoryActionsProps {
  row: Row<Category>;
  table: Table<Category>;
}

export function CategoryActions({ row, table }: CategoryActionsProps) {
  const category = row.original;
  const supabase = createClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    const deleteAction = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) throw new Error("Nicht authentifiziert");

      await deleteCategory(token, category.id);

      const meta = table.options.meta as { onCategoryDeleted?: () => void };
      if (meta?.onCategoryDeleted) {
        meta.onCategoryDeleted();
      }
      setShowDeleteDialog(false);
      return { name: category.name };
    };

    try {
      await toast.promise(deleteAction(), {
        loading: "Wird gelöscht...",
        success: (data) => `Kategorie "${data.name}" wurde gelöscht`,
        error: "Fehler beim Löschen der Kategorie",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menü öffnen</span>
              <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Optionen</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCategoryDialog
        category={category}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onCategoryUpdated={() => {
          const meta = table.options.meta as {
            onCategoryUpdated?: () => void;
            onCategoryDeleted?: () => void;
          };
          if (meta?.onCategoryUpdated) {
            meta.onCategoryUpdated();
          } else if (meta?.onCategoryDeleted) {
            meta.onCategoryDeleted();
          }
        }}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategorie löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du die Kategorie &quot;{category.name}&quot;
              löschen möchtest? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Wird gelöscht..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

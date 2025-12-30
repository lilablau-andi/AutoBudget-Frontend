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
import { Expense } from "../../lib/types";
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
import { deleteExpense } from "@/utils/api/expenses";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import EditExpenseDialog from "./edit-expense-dialog";

interface ExpenseActionsProps {
  row: Row<Expense>;
  table: Table<Expense>;
}

export function ExpenseActions({ row, table }: ExpenseActionsProps) {
  const expense = row.original;
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

      await deleteExpense(token, expense.id);

      const meta = table.options.meta as { onExpenseDeleted?: () => void };
      if (meta?.onExpenseDeleted) {
        meta.onExpenseDeleted();
      }
      setShowDeleteDialog(false);
      return { description: expense.description || "Ausgabe" };
    };

    try {
      await toast.promise(deleteAction(), {
        loading: "Wird gelöscht...",
        success: (data) => `${data.description} wurde gelöscht`,
        error: "Fehler beim Löschen der Ausgabe",
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

      <EditExpenseDialog
        expense={expense}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onExpenseUpdated={() => {
          const meta = table.options.meta as {
            onExpenseDeleted?: () => void;
            onExpenseUpdated?: () => void;
          };
          if (meta?.onExpenseUpdated) {
            meta.onExpenseUpdated();
          } else if (meta?.onExpenseDeleted) {
            meta.onExpenseDeleted();
          }
        }}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ausgabe löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du diese Ausgabe löschen möchtest? Diese
              Aktion kann nicht rückgängig gemacht werden.
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

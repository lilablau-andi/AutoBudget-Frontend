"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDownIcon,
  ArrowUp02Icon,
  ArrowDown02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Expense } from "../../lib/types";
import { ExpenseActions } from "./expense-actions";
import { CategoryCell } from "./category-cell";

function SortIcon({ column }: { column: any }) {
  const sorted = column.getIsSorted();

  if (sorted === "asc") {
    return (
      <HugeiconsIcon
        icon={ArrowUp02Icon}
        className="ml-2 h-4 w-4 text-foreground"
      />
    );
  }

  if (sorted === "desc") {
    return (
      <HugeiconsIcon
        icon={ArrowDown02Icon}
        className="ml-2 h-4 w-4 text-foreground"
      />
    );
  }

  return (
    <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4 opacity-40" />
  );
}

export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "expense_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex items-center gap-1 px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Datum
        <SortIcon column={column} />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("expense_date"));
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const rowDate = new Date(row.getValue<string>(columnId));
      const { from, to } = filterValue as {
        from?: Date;
        to?: Date;
      };

      if (from && rowDate < from) return false;
      if (to && rowDate > to) return false;

      return true;
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex items-center gap-1 px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Kategorie
        <SortIcon column={column} />
      </Button>
    ),
    cell: ({ row, table }) => {
      const expense = row.original;
      return (
        <CategoryCell
          expense={expense}
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
      );
    },
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const category = row.getValue(columnId) as Expense["category"];
      return category ? filterValue.includes(category.name) : false;
    },
  },
  {
    accessorKey: "description",
    header: "Beschreibung",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div
          className="max-w-[300px] truncate text-foreground"
          title={row.getValue("description")}
        >
          {row.getValue("description") || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex items-center gap-1 px-0 justify-end w-full"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Betrag
        <SortIcon column={column} />
      </Button>
    ),
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(row.original.amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => <ExpenseActions row={row} table={table} />,
  },
];

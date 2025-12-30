"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDownIcon,
  ArrowUp02Icon,
  ArrowDown02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Category } from "@/utils/api/categories";
import { CategoryActions } from "./category-actions";

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

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex items-center gap-1 px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <SortIcon column={column} />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium text-foreground">
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex items-center gap-1 px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Typ
        <SortIcon column={column} />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <div className="capitalize text-muted-foreground">
          {type === "expense" ? "Ausgabe" : "Einnahme"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => <CategoryActions row={row} table={table} />,
  },
];

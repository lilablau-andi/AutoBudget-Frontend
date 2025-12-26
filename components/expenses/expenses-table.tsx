"use client";

import { ColumnFiltersState, getFilteredRowModel } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDownIcon,
  ArrowUp02Icon,
  ArrowDown02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DateRange } from "react-day-picker";
import { Expense } from "./types";
import { ExpensesTableToolbar } from "./expenses-table-toolbar";

const columns: ColumnDef<Expense>[] = [
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
    header: "Kategorie",
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId));
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
];

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

interface ExpensesTableProps {
  data: Expense[];
}

export function ExpensesTable({ data }: ExpensesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  const categories = Array.from(new Set(data.map((item) => item.category)));

  return (
    <>
      <ExpensesTableToolbar
        table={table}
        dateRange={dateRange}
        setDateRange={setDateRange}
        categories={categories}
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Gesamt</TableCell>
            <TableCell className="text-right">
              {new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
              }).format(
                data.reduce((total, expense) => total + expense.amount, 0)
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}

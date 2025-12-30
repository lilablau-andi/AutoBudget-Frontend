"use client";

import {
  ColumnFiltersState,
  getFilteredRowModel,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Expense } from "../../lib/types";
import { ExpensesTableToolbar } from "./expenses-table-toolbar";
import { columns } from "./expenses-table-columns";

interface ExpensesTableProps {
  data: Expense[];
  onExpenseDeleted?: () => void;
  onExpenseUpdated?: () => void;
}

export function ExpensesTable({
  data,
  onExpenseDeleted,
  onExpenseUpdated,
}: ExpensesTableProps) {
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
    meta: {
      onExpenseDeleted,
      onExpenseUpdated,
    },
  });
  const categories = Array.from(
    new Set(
      data
        .map((item) => item.category?.name)
        .filter((name): name is string => !!name)
    )
  );

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
            <TableCell colSpan={3}>Gesamt</TableCell>
            <TableCell className="text-right">
              {new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
              }).format(
                data.reduce((total, expense) => total + expense.amount, 0)
              )}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}

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
import { Skeleton } from "@/components/ui/skeleton";
import { Expense, Category, PaginationMeta } from "../../lib/types";
import { ExpensesTableToolbar } from "./expenses-table-toolbar";
import { columns } from "./expenses-table-columns";
import { DateRange } from "react-day-picker";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ExpensesTableProps {
  data: Expense[];
  loading?: boolean;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  categories: Category[];
  selectedCategoryIds: number[];
  onCategoryIdsChange: (ids: number[]) => void;
  onExpenseDeleted?: () => void;
  onExpenseUpdated?: () => void;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  selectedType?: "expense" | "income";
  onTypeChange?: (type: "expense" | "income" | undefined) => void;
}

export function ExpensesTable({
  data,
  loading,
  dateRange,
  onDateRangeChange,
  categories,
  selectedCategoryIds,
  onCategoryIdsChange,
  onExpenseDeleted,
  onExpenseUpdated,
  pagination,
  onPageChange,
  selectedType,
  onTypeChange,
}: ExpensesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  return (
    <>
      <ExpensesTableToolbar
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryIdsChange={onCategoryIdsChange}
        selectedType={selectedType}
        onTypeChange={onTypeChange}
      />
      <div>
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
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Keine Ergebnisse.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Gesamt</TableCell>
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
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.page > 1) {
                      onPageChange?.(pagination.page - 1);
                    }
                  }}
                  className={
                    pagination.page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: pagination.total_pages }).map((_, i) => {
                const pageNum = i + 1;
                // Show current page, first, last, and pages around current
                if (
                  pageNum === 1 ||
                  pageNum === pagination.total_pages ||
                  (pageNum >= pagination.page - 1 &&
                    pageNum <= pagination.page + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={pagination.page === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange?.(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  pageNum === pagination.page - 2 ||
                  pageNum === pagination.page + 2
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.page < pagination.total_pages) {
                      onPageChange?.(pagination.page + 1);
                    }
                  }}
                  className={
                    pagination.page === pagination.total_pages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}

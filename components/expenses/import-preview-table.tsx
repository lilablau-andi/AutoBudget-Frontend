"use client";

import * as React from "react";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Delete02Icon, Calendar02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";

import { ImportedTransaction, Category } from "@/lib/types";
import { CategorySelect } from "./category-select";

export type ImportRow = ImportedTransaction & { _id: string };

interface ImportPreviewTableProps {
  data: ImportRow[];
  categories: Category[];
  onUpdate: (id: string, field: keyof ImportedTransaction, value: any) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkUpdate: (
    ids: string[],
    field: keyof ImportedTransaction,
    value: any
  ) => void;
}

const DateCell = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setInputValue(format(date, "dd.MM.yyyy", { locale: de }));
          return;
        }
      } catch (e) {
        // ignore
      }
    }
    setInputValue("");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    try {
      const parsed = parse(e.target.value, "dd.MM.yyyy", new Date(), {
        locale: de,
      });
      if (
        parsed instanceof Date &&
        !isNaN(parsed.getTime()) &&
        e.target.value.length === 10
      ) {
        onChange(parsed.toISOString());
      }
    } catch (e) {
      // ignore
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date.toISOString());
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <div className="relative group">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onClick={() => setOpen(true)}
              className="w-[120px] h-9 text-sm cursor-pointer"
              placeholder="TT.MM.JJJJ"
            />
          </div>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={handleCalendarSelect}
          initialFocus
          locale={de}
        />
      </PopoverContent>
    </Popover>
  );
};

const AmountCell = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) => {
  const [localValue, setLocalValue] = React.useState("");

  React.useEffect(() => {
    setLocalValue(value.toString().replace(".", ","));
  }, [value]);

  const handleBlur = () => {
    const normalized = localValue.replace(",", ".");
    const number = parseFloat(normalized);
    if (!isNaN(number)) {
      onChange(number);
    } else {
      setLocalValue(value.toString().replace(".", ","));
    }
  };

  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="h-9 text-right font-mono"
    />
  );
};

export function ImportPreviewTable({
  data,
  categories,
  onUpdate,
  onDelete,
  onBulkDelete,
  onBulkUpdate,
}: ImportPreviewTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [bulkType, setBulkType] = React.useState<string>("");

  const columns: ColumnDef<ImportRow>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={
              table.getIsAllPageRowsSelected() ||
              table.getIsSomePageRowsSelected()
            }
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-primary"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-primary"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "expense_date",
        header: "Datum",
        size: 140,
        cell: ({ row }) => (
          <DateCell
            value={row.original.expense_date}
            onChange={(val) => onUpdate(row.original._id, "expense_date", val)}
          />
        ),
      },
      {
        accessorKey: "description",
        header: "Beschreibung",
        size: 250,
        cell: ({ row }) => (
          <Input
            value={row.original.description}
            onChange={(e) =>
              onUpdate(row.original._id, "description", e.target.value)
            }
            className="h-9"
          />
        ),
      },
      {
        accessorKey: "type",
        header: "Typ",
        size: 130,
        cell: ({ row }) => (
          <Select
            value={row.original.type}
            onValueChange={(val) => {
              onUpdate(row.original._id, "type", val);
              onUpdate(row.original._id, "category_id", null);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue>
                {row.original.type === "expense" ? "Ausgabe" : "Einnahme"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Ausgabe</SelectItem>
              <SelectItem value="income">Einnahme</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Betrag</div>,
        size: 100,
        cell: ({ row }) => (
          <AmountCell
            value={row.original.amount}
            onChange={(val) => onUpdate(row.original._id, "amount", val)}
          />
        ),
      },
      {
        accessorKey: "category_id",
        header: "Kategorie",
        size: 220,
        cell: ({ row }) => (
          <CategorySelect
            value={row.original.category_id?.toString() || ""}
            onValueChange={(val) =>
              onUpdate(row.original._id, "category_id", parseInt(val))
            }
            type={row.original.type}
            categories={categories}
          />
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        size: 50,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original._id)}
            className="h-9 w-9 text-destructive opacity-70 hover:opacity-100"
          >
            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [categories, onUpdate, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 100, // Default show more rows
      },
    },
  });

  const selectedCount = Object.keys(rowSelection).length;
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original._id);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
        <div className="text-sm text-muted-foreground">
          {selectedCount > 0
            ? `${selectedCount} Zeile(n) ausgewählt`
            : "Wähle Zeilen für die Massenbearbeitung"}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap animate-in fade-in duration-300">
            <span className="text-sm font-medium whitespace-nowrap hidden sm:inline-block mr-2">
              Bearbeiten:
            </span>

            {/* Type Filter */}
            <Select
              value={bulkType}
              onValueChange={(val) => {
                setBulkType(val || "");
                onBulkUpdate(selectedIds, "type", val);
                onBulkUpdate(selectedIds, "category_id", null);
              }}
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Typ...">
                  {bulkType === "expense"
                    ? "Ausgabe"
                    : bulkType === "income"
                    ? "Einnahme"
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Ausgabe</SelectItem>
                <SelectItem value="income">Einnahme</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Bulk Edit */}
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 font-normal"
                  >
                    Datum...
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={undefined}
                  onSelect={(date) => {
                    if (date) {
                      onBulkUpdate(
                        selectedIds,
                        "expense_date",
                        date.toISOString()
                      );
                    }
                  }}
                  initialFocus
                  locale={de}
                />
              </PopoverContent>
            </Popover>

            {/* Description Bulk Edit */}
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 font-normal"
                  >
                    Beschreibung...
                  </Button>
                }
              />
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">
                    Beschreibung ändern
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Neue Beschreibung..."
                      id="bulk-desc-input"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(
                          "bulk-desc-input"
                        ) as HTMLInputElement;
                        if (input && input.value) {
                          onBulkUpdate(selectedIds, "description", input.value);
                        }
                      }}
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Category Select */}
            <div className="w-[200px]">
              <CategorySelect
                value=""
                onValueChange={(val) => {
                  onBulkUpdate(selectedIds, "category_id", parseInt(val));
                }}
                categories={categories}
                placeholder="Kategorie zuweisen..."
              />
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onBulkDelete(selectedIds);
                setRowSelection({});
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
              Löschen
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  className="h-32 text-center text-muted-foreground"
                >
                  Keine Transaktionen gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Zurück
        </Button>
        <span className="text-sm text-muted-foreground">
          Seite {table.getState().pagination.pageIndex + 1} von{" "}
          {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}

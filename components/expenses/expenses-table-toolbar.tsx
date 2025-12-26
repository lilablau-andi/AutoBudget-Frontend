"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Cancel01Icon,
  Tick02Icon,
  UnfoldMoreIcon,
  Calendar02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";
import { Invoice } from "./types";

interface ExpensesTableToolbarProps {
  table: Table<Invoice>;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  categories: string[];
}

export function ExpensesTableToolbar({
  table,
  dateRange,
  setDateRange,
  categories,
}: ExpensesTableToolbarProps) {
  const [open, setOpen] = useState(false);

  const activeCategories =
    (table.getColumn("category")?.getFilterValue() as string[]) ?? [];

  const hasActiveFilters =
    table.getState().columnFilters.length > 0 || !!dateRange;

  function toggleCategory(category: string) {
    const column = table.getColumn("category");
    if (!column) return;

    const current = (column.getFilterValue() as string[]) ?? [];

    const next = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];

    column.setFilterValue(next.length ? next : undefined);
  }

  return (
    <div className="flex items-center gap-4 mb-4 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {activeCategories.length === 0
                ? "Kategorie filtern"
                : `${activeCategories.length} Filter aktiv`}
              <HugeiconsIcon icon={UnfoldMoreIcon} className="opacity-50" />
            </Button>
          }
        />

        <PopoverContent className="w-[220px] p-0">
          <Command
            shouldFilter={false}
            className="**:data-selected:bg-transparent"
          >
            <CommandList>
              <CommandEmpty>Keine Kategorie gefunden</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    table.getColumn("category")?.setFilterValue(undefined);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer hover:bg-muted!",
                    activeCategories.length === 0 && "bg-muted"
                  )}
                >
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className={cn(
                      "mr-2 h-4 w-4",
                      activeCategories.length === 0
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  Alle Kategorien
                </CommandItem>

                {categories.map((category) => {
                  const isActive = activeCategories.includes(category);

                  return (
                    <CommandItem
                      key={category}
                      value={category}
                      onSelect={() => toggleCategory(category)}
                      className={cn(
                        "cursor-pointer hover:bg-muted!",
                        isActive && "bg-muted"
                      )}
                    >
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className={cn(
                          "mr-2 h-4 w-4 transition-opacity",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {category}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={() => {
            table.resetColumnFilters();
            setDateRange(undefined);
            setOpen(false);
          }}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-1" />
          Filter zurücksetzen
        </Button>
      )}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal ml-auto"
            >
              <HugeiconsIcon icon={Calendar02Icon} />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd.MM.yyyy")} –{" "}
                    {format(dateRange.to, "dd.MM.yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd.MM.yyyy")
                )
              ) : (
                "Zeitraum filtern"
              )}
            </Button>
          }
        />

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              setDateRange(range);

              table
                .getColumn("date")
                ?.setFilterValue(range?.from || range?.to ? range : undefined);
            }}
            locale={de}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

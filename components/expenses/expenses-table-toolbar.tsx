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
import { useState } from "react";
import { Expense, Category } from "../../lib/types";
import { format, subDays, differenceInDays, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

interface ExpensesTableToolbarProps {
  table: Table<Expense>;
  loading?: boolean;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  categories: Category[];
  selectedCategoryIds: number[];
  onCategoryIdsChange: (ids: number[]) => void;
}

const DAY_OPTIONS = [
  { label: "Letzte 30 Tage", value: 30 },
  { label: "Letzte 60 Tage", value: 60 },
  { label: "Letzte 90 Tage", value: 90 },
  { label: "Letzte 180 Tage", value: 180 },
  { label: "Letztes Jahr", value: 365 },
];

export function ExpensesTableToolbar({
  table,
  loading,
  dateRange,
  onDateRangeChange,
  categories,
  selectedCategoryIds,
  onCategoryIdsChange,
}: ExpensesTableToolbarProps) {
  const [open, setOpen] = useState(false);
  const [daysOpen, setDaysOpen] = useState(false);

  const hasActiveFilters = selectedCategoryIds.length > 0;

  function toggleCategory(categoryId: number) {
    const next = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    onCategoryIdsChange(next);
  }

  const getActiveLabel = () => {
    if (!dateRange || !dateRange.from) return "Zeitraum auswählen";
    if (!dateRange.to)
      return format(dateRange.from, "dd.MM.yyyy", { locale: de });

    const now = new Date();
    const diff = differenceInDays(dateRange.to, dateRange.from);
    const isToToday = isSameDay(dateRange.to, now);

    if (isToToday) {
      const option = DAY_OPTIONS.find((opt) => opt.value === diff);
      if (option) return option.label;
    }

    return `${format(dateRange.from, "dd.MM.yy", { locale: de })} - ${format(
      dateRange.to,
      "dd.MM.yy",
      { locale: de }
    )}`;
  };

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
              {selectedCategoryIds.length === 0
                ? "Kategorie filtern"
                : `${selectedCategoryIds.length} Filter aktiv`}
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
                    onCategoryIdsChange([]);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer hover:bg-muted!",
                    selectedCategoryIds.length === 0 && "bg-muted"
                  )}
                >
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCategoryIds.length === 0
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  Alle Kategorien
                </CommandItem>

                {categories.map((category) => {
                  const isActive = selectedCategoryIds.includes(category.id);

                  return (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => toggleCategory(category.id)}
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
                      {category.name}
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
            onCategoryIdsChange([]);
            setOpen(false);
          }}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-1" />
          Filter zurücksetzen
        </Button>
      )}

      <Popover open={daysOpen} onOpenChange={setDaysOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="w-auto min-w-[200px] justify-between ml-auto px-3"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar02Icon} className="h-4 w-4" />
                {getActiveLabel()}
              </div>
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                className="opacity-50 ml-2"
              />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x">
            <div className="p-2 flex flex-col gap-1 min-w-[160px]">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Presets
              </div>
              {DAY_OPTIONS.map((option) => {
                const isActive =
                  dateRange?.from &&
                  dateRange?.to &&
                  isSameDay(dateRange.to, new Date()) &&
                  differenceInDays(dateRange.to, dateRange.from) ===
                    option.value;

                return (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start font-normal h-8",
                      isActive && "bg-muted"
                    )}
                    onClick={() => {
                      onDateRangeChange({
                        from: subDays(new Date(), option.value),
                        to: new Date(),
                      });
                      setDaysOpen(false);
                    }}
                  >
                    {isActive && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="mr-2 h-3.5 w-3.5"
                      />
                    )}
                    {!isActive && <div className="w-5" />}
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <div className="p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range, selectedDay) => {
                  if (dateRange?.from && dateRange?.to) {
                    onDateRangeChange({ from: selectedDay, to: undefined });
                  } else {
                    onDateRangeChange(range);
                  }
                }}
                numberOfMonths={1}
                locale={de}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

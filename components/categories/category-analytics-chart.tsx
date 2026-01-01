"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import { format, subDays, differenceInDays, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { createClient } from "@/utils/supabase/client";
import { getCategoryAnalytics } from "@/utils/api/analytics";
import { CategoryAnalyticsData } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Tick02Icon,
  UnfoldMoreIcon,
  Calendar02Icon,
  Chart01Icon,
  Chart02Icon,
  PieChartIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DAY_OPTIONS = [
  { label: "Letzte 7 Tage", value: 7 },
  { label: "Letzte 30 Tage", value: 30 },
  { label: "Letzte 90 Tage", value: 90 },
  { label: "Letzte 180 Tage", value: 180 },
  { label: "Letztes Jahr", value: 365 },
];

export function CategoryAnalyticsChart() {
  const supabase = createClient();
  const [view, setView] = React.useState("area");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [daysOpen, setDaysOpen] = React.useState(false);
  const [data, setData] = React.useState<CategoryAnalyticsData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    setLoading(true);
    try {
      const analytics = await getCategoryAnalytics(
        token,
        format(dateRange.from, "yyyy-MM-dd"),
        format(dateRange.to, "yyyy-MM-dd")
      );
      setData(analytics);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, dateRange]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

  const categories = React.useMemo(() => {
    const cats = new Map<string, string>(); // slug -> original name
    data.forEach((item) =>
      cats.set(slugify(item.category_name), item.category_name)
    );
    return Array.from(cats.entries());
  }, [data]);

  const chartData = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const map = new Map<string, any>();
    data.forEach((item) => {
      const slug = slugify(item.category_name);
      if (!map.has(item.date)) {
        map.set(item.date, { date: item.date });
      }
      const entry = map.get(item.date);
      entry[slug] = item.sum;
    });

    const result = [];
    const start = new Date(dateRange.from);
    const end = new Date(dateRange.to);

    // Get all category slugs to fill with 0
    const catSlugs = categories.map(([slug]) => slug);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "yyyy-MM-dd");
      const entry = { ...(map.get(dateStr) || { date: dateStr }) };

      // Ensure every category has at least 0 if missing
      catSlugs.forEach((slug) => {
        if (entry[slug] === undefined) {
          entry[slug] = 0;
        }
      });

      result.push(entry);
    }

    return result.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data, dateRange, categories]);

  const pieData = React.useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => {
      const slug = slugify(item.category_name);
      map.set(slug, (map.get(slug) || 0) + item.sum);
    });
    return Array.from(map.entries()).map(([slug, sum]) => ({
      category: slug,
      sum: sum,
      fill: `var(--color-${slug})`,
    }));
  }, [data]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    categories.forEach(([slug, name], index) => {
      config[slug] = {
        label: name,
        color: `var(--chart-${(index % 5) + 1})`,
      };
    });
    return config;
  }, [categories]);

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
    <Card className="shadow-lg">
      <CardHeader className="flex gap-4 space-y-0 border-b flex-col">
        <div className="grid flex-1 gap-1">
          <CardTitle>Ausgaben nach Kategorie</CardTitle>
        </div>

        <div className="flex w-full items-center gap-4 justify-between">
          <Tabs
            value={view}
            onValueChange={(v) => v && setView(v)}
            className="h-9"
          >
            <TabsList className="bg-muted p-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <TabsTrigger value="area" className="px-3">
                      <HugeiconsIcon icon={Chart02Icon} className="h-4 w-4" />
                    </TabsTrigger>
                  }
                />
                <TooltipContent>Flächendiagramm</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <TabsTrigger value="bar" className="px-3">
                      <HugeiconsIcon icon={Chart01Icon} className="h-4 w-4" />
                    </TabsTrigger>
                  }
                />
                <TooltipContent>Balkendiagramm</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <TabsTrigger value="pie" className="px-3">
                      <HugeiconsIcon icon={PieChartIcon} className="h-4 w-4" />
                    </TabsTrigger>
                  }
                />
                <TooltipContent>Kreisdiagramm</TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>

          <Popover open={daysOpen} onOpenChange={setDaysOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className="w-auto min-w-[200px] justify-between px-3 h-9"
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
                          setDateRange({
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
                        setDateRange({ from: selectedDay, to: undefined });
                      } else {
                        setDateRange(range);
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
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-end justify-between h-[250px] w-full gap-2">
              <Skeleton className="w-full h-[60%]" />
              <Skeleton className="w-full h-[80%]" />
              <Skeleton className="w-full h-[40%]" />
              <Skeleton className="w-full h-[90%]" />
              <Skeleton className="w-full h-[50%]" />
              <Skeleton className="w-full h-[70%]" />
              <Skeleton className="w-full h-[30%]" />
            </div>
            <div className="flex justify-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
            Keine Daten im gewählten Zeitraum
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            {view === "area" ? (
              <AreaChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return format(date, "d. MMM", { locale: de });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return format(new Date(value), "PPP", { locale: de });
                      }}
                      indicator="dot"
                    />
                  }
                />
                {categories.map(([slug, name]) => (
                  <Area
                    key={slug}
                    dataKey={slug}
                    type="monotone"
                    fill={`var(--color-${slug})`}
                    fillOpacity={0.4}
                    stroke={`var(--color-${slug})`}
                    stackId="a"
                    connectNulls
                  />
                ))}
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            ) : view === "bar" ? (
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return format(date, "d. MMM", { locale: de });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return format(new Date(value), "PPP", { locale: de });
                      }}
                      indicator="dot"
                    />
                  }
                />
                {categories.map(([slug, name], index) => (
                  <Bar
                    key={slug}
                    dataKey={slug}
                    stackId="a"
                    fill={`var(--color-${slug})`}
                    radius={
                      index === categories.length - 1
                        ? [4, 4, 0, 0]
                        : [0, 0, 0, 0]
                    }
                  />
                ))}
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            ) : (
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieData}
                  dataKey="sum"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={5}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

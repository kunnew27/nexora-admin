import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompact, type Currency } from "@/lib/finance";

export type CategorySpendDatum = {
  categoryId: string;
  name: string;
  value: number; // display currency
  fill: string; // category color
};

/**
 * Share of this month's spending per category, styled after the dashboard-3
 * traffic-by-channel donut. Slice labels are omitted on purpose — the stacked
 * legend below the chart carries names and percentages.
 */
export function CategoryDonutChart({
  data,
  currency,
  className,
  ...props
}: ComponentProps<typeof Card> & {
  data: CategorySpendDatum[];
  currency: Currency;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const chartConfig = {
    value: { label: "Spent" },
    ...Object.fromEntries(
      data.map((d) => [d.categoryId, { label: d.name, color: d.fill }]),
    ),
  } satisfies ChartConfig;

  return (
    <Card className={cn("flex flex-col", className)} {...props}>
      <CardHeader className="space-y-1 pb-0">
        <CardTitle>Spending by category</CardTitle>
        <CardDescription>
          Share of expenses this month · {formatCompact(total, currency)}
        </CardDescription>
      </CardHeader>
      {data.length > 0 ? (
        <CardContent className="flex flex-1 flex-col justify-center gap-4">
          <ChartContainer
            className="mx-auto aspect-square max-h-56 w-full"
            config={chartConfig}
          >
            <PieChart accessibilityLayer>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-medium tabular-nums">
                          {formatCompact(Number(value), currency)}
                        </span>
                      </div>
                    )}
                    hideIndicator
                  />
                }
                cursor={false}
              />
              <Pie
                cornerRadius={8}
                data={data}
                dataKey="value"
                innerRadius={36}
                nameKey="categoryId"
                outerRadius="92%"
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={4}
              />
            </PieChart>
          </ChartContainer>
          <ul className="flex flex-col gap-1.5" aria-label="Category share">
            {data.map((d) => (
              <li
                className="flex items-center gap-2 text-xs"
                key={d.categoryId}
              >
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: d.fill }}
                />
                <span className="truncate text-muted-foreground">{d.name}</span>
                <span className="ml-auto shrink-0 font-medium tabular-nums">
                  {total > 0 ? `${Math.round((d.value / total) * 100)}%` : "0%"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      ) : (
        <CardContent className="my-auto text-center text-muted-foreground text-sm">
          No expenses recorded this month yet.
        </CardContent>
      )}
    </Card>
  );
}

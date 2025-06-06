"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  LabelList,
  Cell,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { StockSummary } from "@/hooks/shared/useStockSummary"

interface Props {
  data: StockSummary[]
}

const chartConfig = {
  wiring: {
    label: "Wiring and Conductors",
    color: "var(--category-wiring)",
  },
  poles: {
    label: "Poles and Supports",
    color: "var(--category-poles)",
  },
  metering: {
    label: "Metering Equipment",
    color: "var(--category-metering)",
  },
  transformers: {
    label: "Transformers and Substations Equipment",
    color: "var(--category-transformers)",
  },
  hardware: {
    label: "Hardware and Fasteners",
    color: "var(--category-hardware)",
  },
  safety: {
    label: "Safety Equipment",
    color: "var(--category-safety)",
  },
  tools: {
    label: "Tools and Accessories",
    color: "var(--category-tools)",
  },
  office_supply: {
    label: "Office Supplies",
    color: "var(--category-office_supply)",
  },
  uncategorized: {
    label: "Uncategorized",
    color: "var(--category-uncategorized)",
  },
};


export default function StockBarChart({ data }: Props) {
  const categories = React.useMemo(
    () =>
      Array.from(new Set(data.map((item) => item.category))) as (keyof typeof chartConfig)[],
    [data]
  )

  const [activeCategory, setActiveCategory] = React.useState<string>(
    categories[0] || "electrical"
  )

  const totals = React.useMemo(() => {
    const result: Record<string, number> = {}
    categories.forEach((cat) => {
      result[cat] = data
        .filter((item) => item.category === cat)
        .reduce((acc, curr) => acc + (parseFloat((curr as any).quantity) || 0), 0)
    })
    return result
  }, [data, categories])

  const chartData = React.useMemo(
    () =>
      data
        .filter((item) => item.category === activeCategory)
        .map((item) => ({
          name: item.name,
          quantity: parseFloat((item as any).quantity),
          fill: chartConfig[activeCategory]?.color ?? "#8884d8",
        })),
    [data, activeCategory]
  )

  const barWidth = 60
  const barSpacing = 30
  const chartWidth = chartData.length * (barWidth + barSpacing) + 100

  return (
    <Card className="py-0 h-full flex flex-col">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Stock Levels per Material category</CardTitle>
        </div>
        <div className="flex">
          {categories.map((cat, index) => (
            <button
              key={`cat-${cat}-${index}`}
              data-active={activeCategory === cat}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveCategory(cat)}
            >
              <span className="text-muted-foreground text-xs">
                {chartConfig[cat]?.label || cat}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {totals[cat]?.toLocaleString() ?? 0}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6 flex-1 flex flex-col">
        <ChartContainer config={chartConfig} className="aspect-auto h-full w-full flex-1 flex flex-col">
          <BarChart
            data={chartData}
            height={undefined} // Let it fill the parent
            width={chartWidth}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value.slice(0, 12)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="quantity">
              {chartData.map((entry, index) => (
                <Cell key={`bar-${entry.name}-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="quantity"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { StockSummary } from "@/hooks/shared/useStockSummary"

interface Props {
  data: StockSummary[]
}

export default function StockBarChart({ data }: Props) {
  const departmentColors: Record<string, string> = {
    engineering: "oklch(39.3% 0.095 152.535)",
    finance: "oklch(52.7% 0.154 150.069)",
    operations_maintenance: "oklch(72.3% 0.219 149.579)",
  }

  const departmentLabels: Record<string, string> = {
    engineering: "Engineering",
    finance: "Finance",
    operations_maintenance: "Operations & Maintenance",
  }

  const chartConfig = {
    quantity: {
      label: "Quantity",
      color: "hsl(var(--chart-1))",
    },
  }

  const chartData = data.map((item) => ({
    name: item.name,
    quantity: parseFloat(item.quantity as any),
    fill: departmentColors[item.department],
    department: item.department,
  }))

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Stock Levels</CardTitle>

        {/* Department legend for admin-like roles */}
        {role !== "engineering" &&
          role !== "operations_maintenance" &&
          role !== "finance" && (
            <div className="flex flex-wrap gap-4 mt-6">
              {Object.entries(departmentColors).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-muted-foreground">
                    {departmentLabels[key]}
                  </span>
                </div>
              ))}
            </div>
          )}
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} height={350}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 12)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="quantity" radius={8}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
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

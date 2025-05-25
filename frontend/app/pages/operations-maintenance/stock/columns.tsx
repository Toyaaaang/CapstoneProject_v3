// app/pages/stock/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StockSummary } from "@/hooks/shared/useStockSummary"
import { Badge } from "@/components/ui/badge"

export const stockColumns: ColumnDef<StockSummary>[] = [
  {
    accessorKey: "name",
    header: "Item Name",
    cell: ({ getValue }) => (
       <span className="font-semibold whitespace-nowrap px-2">{getValue() as string}</span>
    ),
    size: 220,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ getValue }) => (
      <span className="font-mono whitespace-nowrap px-2">{Number(getValue()).toLocaleString()}</span>
    ),
    size: 120,
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap px-2">{getValue() as string}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ getValue }) => {
      const dept = getValue() as string
      const labels: Record<string, string> = {
        engineering: "ENGINEERING",
        finance: "FINANCE",
        operations_maintenance: "OPERATIONS & MAINTENANCE",
      }
      const badgeVariants: Record<string, "primary" | "secondary" | "info" | "warning" | "destructive" | "success" | "outline" | "default"> = {
        engineering: "primary",
        finance: "secondary",
        operations_maintenance: "info",
      }
      const variant = badgeVariants[dept] || "secondary"
      return (
        <Badge variant={variant} className="whitespace-nowrap px-2">
          {labels[dept] || (dept ? dept.replace(/_/g, " ").toUpperCase() : "—")}
        </Badge>
      )
    },
    size: 220,
  },
]

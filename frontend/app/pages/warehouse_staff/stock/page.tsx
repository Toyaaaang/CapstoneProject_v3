// app/pages/stock/page.tsx
"use client"

import { useState } from "react"
import StockBarChart from "@/components/charts/barchart"
import useStockSummary from "@/hooks/shared/useStockSummary"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DataTable from "@/components/Tables/DataTable"
import { stockColumns } from "./columns"

export default function StockPage() {
  const { data, isLoading } = useStockSummary()
  const [view, setView] = useState("chart")
  const [page, setPage] = useState(1)
  const pageSize = 10

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Select defaultValue="chart" onValueChange={setView}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chart">Bar Chart</SelectItem>
            <SelectItem value="table">Table</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : view === "chart" ? (
        <StockBarChart data={data} />
      ) : (
        <DataTable
          title="Stock Summary"
          data={data}
          columns={stockColumns}
          page={page}
          setPage={setPage}
          totalCount={data.length}
          pageSize={pageSize}
        />
      )}
    </div>
  )
}

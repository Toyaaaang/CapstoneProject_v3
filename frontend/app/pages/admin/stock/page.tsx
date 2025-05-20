// app/pages/stock/page.tsx
"use client"

import StockBarChart from "@/components/charts/barchart"
import useStockSummary from "@/hooks/shared/useStockSummary"
import { Skeleton } from "@/components/ui/skeleton"


export default function StockPage() {
  const { data, isLoading } = useStockSummary()

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : (
        <StockBarChart data={data} />
      )}
    </div>
  )
}

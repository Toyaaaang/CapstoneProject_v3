import useStockSummaryFull from "@/hooks/shared/useStockSummaryFull"
import StockBarChart from "@/components/charts/barchart"
import { Skeleton } from "@/components/ui/skeleton"

export default function StockChartSection() {
  const { data, isLoading } = useStockSummaryFull()

  if (isLoading) return <Skeleton className="h-[350px] w-full" />

  return <StockBarChart data={data} />
}

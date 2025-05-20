"use client"

import StockBarChart from "@/components/charts/barchart"
import useStockByDepartment from "@/hooks/shared/useStockByDepartment"
import { Loader } from "lucide-react"

export default function EngineeringStockPage() {
  const { data, isLoading } = useStockByDepartment("engineering")

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-6 w-6" />
        </div>
      ) : (
        <StockBarChart data={data} />
      )}
    </div>
  )
}

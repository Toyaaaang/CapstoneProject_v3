// hooks/shared/useStockSummaryPaginated.ts
import axios from "@/lib/axios"
import { useEffect, useState } from "react"

export interface StockSummary {
  name: string
  unit: string
  quantity: number | string
  category: string
}

export default function useStockSummaryPaginated(page = 1) {
  const [data, setData] = useState<StockSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await axios.get(`/inventory-summary/?page=${page}`)
      if (res.data.results) {
        setData(res.data.results)
        setTotalCount(res.data.count)
      } else {
        setData(res.data)
        setTotalCount(res.data.length)
      }
    } catch (error) {
      setError(error as Error)
      console.error("Failed to fetch paginated stock summary:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [page])

  return { data, totalCount, isLoading, error, refetch: fetch }
}

import axios from "@/lib/axios"
import { useEffect, useState } from "react"

export interface StockSummary {
  name: string
  unit: string
  quantity: number | string
  category: string
}

export default function useStockSummary() {
  const [data, setData] = useState<StockSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get("/inventory-summary-full/") // 👈 Non-paginated
      setData(res.data)
    } catch (err) {
      setError(err as Error)
      console.error("Chart fetch failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  return { data, isLoading, error, refetch: fetch }
}

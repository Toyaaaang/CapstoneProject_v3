import axios from "@/lib/axios"
import { useEffect, useState } from "react"

export interface StockSummary {
  name: string
  unit: string
  quantity: number
  department: string
}

export default function useStockSummary() {
  const [data, setData] = useState<StockSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetch = async () => {
    try {
      const res = await axios.get("/inventory-summary/")
      setData(res.data.results || res.data)
    } catch (error) {
      console.error("Failed to fetch stock summary:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  return { data, isLoading, refetch: fetch }
}

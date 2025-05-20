// hooks/useStockSummary.ts
import axios from "@/lib/axios"
import { useEffect, useState } from "react"

export interface StockSummary {
  name: string
  unit: string
  quantity: number
  department: string
}

// hooks/useStockSummary.ts
export default function useStockSummary() {
  const [data, setData] = useState<StockSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetch = async () => {   
    const res = await axios.get("/inventory-summary/")
    // FIX: if using pagination, use res.data.results instead
    setData(res.data.results || res.data) 
    setIsLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [])

  return { data, isLoading, refetch: fetch }
}

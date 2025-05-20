import { useEffect, useState } from "react"
import axios from "@/lib/axios"

export interface StockSummary {
  name: string
  unit: string
  quantity: number
  department: string
}

export default function useStockByDepartment(department: string) {
  const [data, setData] = useState<StockSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/inventory-by-department/", {
          params: { department },
        })
        setData(res.data)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [department])

  return { data, isLoading }
}

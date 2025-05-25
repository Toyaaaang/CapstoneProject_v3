import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function usePurchaseHistory(page: number, pageSize: number) {
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/requests/purchase-orders/history/");
      setAllData(res.data);
    } catch (err) {
      console.error("Failed to fetch purchase history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Manual slice based on page
  const start = (page - 1) * pageSize;
  const pagedData = allData.slice(start, start + pageSize);

  return {
    data: pagedData,
    totalCount: allData.length,
    isLoading: loading,
    refetch: fetchHistory,
  };
}

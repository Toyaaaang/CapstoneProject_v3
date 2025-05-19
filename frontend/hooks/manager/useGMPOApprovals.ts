import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function useGMPOApprovals(page: number, pageSize: number = 10) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/requests/purchase-orders", {
        params: {
          status: "recommended", // ✅ GM sees only recommended POs
          page,
          page_size: pageSize,
        },
      });
      setData(res.data.results);
      setTotalCount(res.data.count);
    } catch (error) {
      console.error("Failed to load PO approvals for GM", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  return {
    data,
    isLoading,
    totalCount,
    refetch: fetchData,
  };
}

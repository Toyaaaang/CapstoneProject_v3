import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function useDeliveredPOs(page: number, pageSize: number = 10) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetch = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/requests/purchase-orders/", {
        params: {
          delivered: "true",
          page,
          page_size: pageSize,
        },
      });
      setData(res.data.results);
      setTotalCount(res.data.count);
    } catch (err) {
      console.error("Failed to load delivered POs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [page, pageSize]);

  return { data, isLoading, totalCount, refetch: fetch };
}

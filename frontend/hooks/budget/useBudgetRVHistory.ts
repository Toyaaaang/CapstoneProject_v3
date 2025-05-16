import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function useBudgetRVHistory(page: number, pageSize: number = 10) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/requests/requisition-vouchers/", {
        params: {
          handled_by_me: "true",
          page,
          page_size: pageSize,
        },
      });
      setData(res.data.results);
      setTotalCount(res.data.count);
    } catch (err) {
      console.error("Failed to load RV history", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  return { data, isLoading, totalCount, refetch: fetchData };
}

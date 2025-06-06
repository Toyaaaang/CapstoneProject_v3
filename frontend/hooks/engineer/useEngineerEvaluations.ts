import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";

export function useEngineerEvaluations(page: number) {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const pageSize = 8;

  const fetchData = () => {
    setLoading(true);
    axios
      .get("/requests/material-requests/", {
        params: { page },
      })
      .then((res) => {
        setData(res.data.results);
        setTotalCount(res.data.count);
      })
      .catch(() => {
        toast.error("Failed to load evaluation requests.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  return {
    data,
    isLoading,
    totalCount,
    refetch: fetchData,
  };
}

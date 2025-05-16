import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export function useMaterialRequests() {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const pageSize = 8;

  const fetchData = async (pageNumber = 1) => {
  setLoading(true);
  try {
    const res = await axios.get(
      `requests/material-requests/my_requests/?page=${pageNumber}`
    );
    const data = res.data as { results: any[]; count: number };
    setData(data.results);
    setTotalCount(data.count);
    const typedData = res.data as { results: any[]; count: number };


  } catch (err) {
    console.error("Failed to fetch material requests:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchData(page);
  }, [page]);

  return {
    data,
    totalCount,
    page,
    setPage,
    isLoading,
    refetch: () => fetchData(page),
  };
}

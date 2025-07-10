import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export function useReleasedChargeTicketsStaff(page: number) {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/requests/charge-tickets/?page=${page}&status=released`);
      setData(res.data.results);
      setTotalCount(res.data.count);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page]);

  return { data, totalCount, isLoading, refetch: fetchData };
}
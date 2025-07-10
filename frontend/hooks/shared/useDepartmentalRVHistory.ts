import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export type DepartmentalRV = {
  id: number;
  rv_number: string;
  purpose: string;
  status: string;
  created_at: string;
  requester: {
    id: number;
    first_name: string;
    last_name: string;
  };
  items: {
    material?: { name: string };
    custom_name?: string;
    quantity: number;
    unit: string;
  }[];
};

export default function useDepartmentalRVHistory(page: number, pageSize = 10) {
  const [data, setData] = useState<DepartmentalRV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/requests/requisition-vouchers/departmental-history/`, {
        params: {
          page,
          page_size: pageSize,
        },
      });
      setData(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch Departmental RV history:", err);
    } finally {
      setIsLoading(false);
    }
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

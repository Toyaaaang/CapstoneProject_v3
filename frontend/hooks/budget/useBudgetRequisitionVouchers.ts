import { useEffect, useState } from "react";
import axios from "@/lib/axios";

interface RequisitionVoucher {
  id: number;
  rv_number: string;
  department: string;
  requester: { username: string };
  created_at: string;
  status: string;
  items: {
    id: number;
    material: string;
    quantity: number;
    unit: string;
  }[];
}

export default function useBudgetRequisitionVouchers(page: number, pageSize: number = 10) {
  const [data, setData] = useState<RequisitionVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/requests/requisition-vouchers/", {
        params: {
          status: "pending",
          page,
          page_size: pageSize,
        },
      });
      setData(res.data.results);
      setTotalCount(res.data.count);
    } catch (error) {
      console.error("Error fetching RVs:", error);
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

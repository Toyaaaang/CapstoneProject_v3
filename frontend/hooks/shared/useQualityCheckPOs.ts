import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export interface QCPO {
  id: number;
  po_number: string;
  department: string;
  created_at: string;
  supplier: string;
  grand_total: string;
  requisition_voucher: {
    department: string;
  };
  items: {
    id: number;
    quantity: number;
    unit: string;
    unit_price: string;
    material: {
      id: number;
      name: string;
    };
  }[];
}

export default function useQualityCheckPOs(page: number, pageSize: number = 10) {
  const [data, setData] = useState<QCPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Normalize department (user role) from localStorage
  const userRole = localStorage.getItem("role")?.toLowerCase();

  const fetchData = async () => {
    if (!userRole) return;

    setIsLoading(true);
    try {
      const res = await axios.get("/requests/purchase-orders/", {
        params: {
          status: "delivered",
          delivered: "true",
          department: userRole,
          page,
          page_size: pageSize,
        },
      });

      setData(res.data?.results || []);
      setTotalCount(res.data?.count || 0);
    } catch (err) {
      console.error("Failed to load PO QC list", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, userRole]);

  return {
    data,
    isLoading,
    totalCount,
    refetch: fetchData,
    refreshData: fetchData,
  };
}

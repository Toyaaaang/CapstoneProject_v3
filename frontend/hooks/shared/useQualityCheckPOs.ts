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
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchData = async (role: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get("/requests/purchase-orders/", {
        params: {
          status: "delivered",
          delivered: "true",
          department: role,
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
    const getUserRoleAndFetch = async () => {
      try {
        const me = await axios.get("/authentication/me/");
        const role = me.data?.role?.toLowerCase();
        if (role) {
          setUserRole(role);
          fetchData(role);
        }
      } catch (err) {
        console.error("Failed to fetch user role from /me/", err);
      }
    };

    getUserRoleAndFetch();
  }, [page, pageSize]);

  return {
    data,
    isLoading,
    totalCount,
    refetch: () => userRole && fetchData(userRole),
    refreshData: () => userRole && fetchData(userRole),
  };
}

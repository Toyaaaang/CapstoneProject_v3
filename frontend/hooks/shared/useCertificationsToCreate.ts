import { useState, useEffect } from "react";
import axios from "@/lib/axios";

export interface CertifiableItem {
  id: number;
  delivery_record_id: number;
  po_item: {
    custom_name: string;
    id: number;
    material: {
      name: string;
    };
    quantity: number;
    unit: string;
  };
  quality_check: {
    purchase_order: {
      po_number: string;
      delivery_date: string;
    };
    requisition_voucher: {
      rv_number: string;
      department: string;
    };
  };
  remarks: string | null;
}

interface UseCertificationsToCreateProps {
  page: number;
  pageSize: number;
}

export default function useCertificationsToCreate({ page, pageSize }: UseCertificationsToCreateProps) {
  const [data, setData] = useState<CertifiableItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const role = typeof window !== "undefined" ? localStorage.getItem("role")?.toLowerCase() : null;

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const params: Record<string, any> = {
        page,
        page_size: pageSize,
      };

      // Only filter if user is department-scoped
      if (role === "engineering" || role === "operations_maintenance") {
        params.department = role;
      }

      const res = await axios.get("/requests/quality-checks/certifiable-items/", { params });

      setData(res.data.results || []);
      setTotalCount(res.data.count || 0);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role) fetchData();
  }, [page, pageSize, role]);

  return {
    data,
    isLoading,
    error,
    totalCount,
    refetch: fetchData,
  };
}

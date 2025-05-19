// hooks/certifications/useCertificationsToCreate.ts
import { useState, useEffect } from "react";
import axios from "@/lib/axios";

export interface CertifiableItem {
  id: number;
  delivery_record_id: number;
  po_item: {
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/requests/quality-checks/certifiable-items/", {
        params: {
          page,
          page_size: pageSize,
        },
      });
      setData(res.data.results); // paginated response
      setTotalCount(res.data.count);
    } catch (err: any) {
      setError(err);
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
    error,
    totalCount,
    refetch: fetchData,
  };
}

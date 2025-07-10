import { useState, useEffect } from "react";
import axios from "@/lib/axios";

export interface CertifiableBatch {
  id: number;
  purchase_order: {
    po_number: string;
    delivery_date: string | null;
  };
  requisition_voucher: {
    rv_number: string;
    department: string;
  };
  items: Array<{
    id: number;
    po_item: {
      custom_name: string;
      id: number;
      material: { name: string } | null;
      quantity: number;
      unit: string;
    };
    remarks: string | null;
    requires_certification: boolean;
    delivery_record_id: number;
    delivery_date: string | null;
  }>;
}

interface UseCertificationsToCreateProps {
  page: number;
  pageSize: number;
}

export default function useCertificationsToCreate({ page, pageSize }: UseCertificationsToCreateProps) {
  const [data, setData] = useState<CertifiableBatch[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get("/authentication/me/");
        setRole(res.data?.role?.toLowerCase() || null);
      } catch (err) {
        setRole(null);
      }
    };
    fetchRole();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const params: Record<string, any> = {
        page,
        page_size: pageSize,
      };

      if (role === "engineering" || role === "operations_maintenance") {
        params.department = role;
      }

      const res = await axios.get("/requests/quality-checks/certifiable-batches/", { params });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, role]);

  return {
    data,
    isLoading,
    error,
    totalCount,
    refetch: fetchData,
  };
}

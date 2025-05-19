import axios from "@/lib/axios";
import { useState, useEffect } from "react";

export interface CertificationRecord {
  id: number;
  purchase_order: {
    po_number: string;
  };
  delivery_record: {
    delivery_date: string;
  };
  created_at: string;
  is_finalized: boolean;
  rejection_reason: string | null;
}

export default function useCertificationsForAdmin() {
  const [data, setData] = useState<CertificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchData = async () => {
    setIsLoading(true);
    const res = await axios.get("/requests/certifications/monitoring/", {
      params: { page, page_size: pageSize },
    });
    setData(res.data.results);
    setTotalCount(res.data.count);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  return {
    data,
    isLoading,
    refetch: fetchData,
    page,
    setPage,
    totalCount,
  };
}

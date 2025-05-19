import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export interface QCItem {
  material_name: string;
  quantity: string;
  unit: string;
  requires_certification: boolean;
  remarks: string;
}

export interface QualityCheck {
  id: number;
  po_number: string;
  supplier: string;
  department: string;
  checked_by: string;  // Optional: expand this if you're including user object
  items: QCItem[];
  created_at: string;
}

export default function useQCHistory(page: number, pageSize: number = 10) {
  const [data, setData] = useState<QualityCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/requests/quality-checks/", {
        params: {
          page,
          page_size: pageSize,
        },
      });
      setData(res.data.results);
      setTotalCount(res.data.count);
    } catch (err) {
      console.error("Failed to load QC history", err);
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

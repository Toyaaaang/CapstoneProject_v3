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
}

export default function useCertificationsForAudit() {
  const [data, setData] = useState<CertificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const res = await axios.get("/requests/certifications/monitoring/");
    setData(res.data.results); // ⬅️ backend already filters for this role
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, refetch: fetchData };
}

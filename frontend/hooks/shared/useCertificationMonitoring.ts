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

export default function useCertificationMonitoring() {
  const [data, setData] = useState<CertificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);


  const fetchData = async () => {
    const res = await axios.get("/requests/certifications/monitoring/");
    setData(res.data.results); // ✅ only grab the array of results
    setIsLoading(false);
    };


  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, refetch: fetchData };
}

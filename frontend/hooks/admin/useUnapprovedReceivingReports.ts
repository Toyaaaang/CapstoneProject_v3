import axios from "@/lib/axios";
import { useState, useEffect } from "react";

export interface ReceivingReport {
  id: number;
  purchase_order: {
    po_number: string;
  };
  delivery_record: {
    id: number;
    delivery_date: string;
  } | null;
  created_by: string;
  remarks: string;
  created_at: string;
  is_approved: boolean;
  items: {
    id: number;
    material_name: string;
    quantity: number;
    unit: string;
  }[];
}

export default function useUnapprovedReceivingReports() {
  const [data, setData] = useState<ReceivingReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const res = await axios.get("/requests/receiving-reports/unapproved/");
    setData(res.data.results);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { reports: data, isLoading, refetch: fetchData };
}

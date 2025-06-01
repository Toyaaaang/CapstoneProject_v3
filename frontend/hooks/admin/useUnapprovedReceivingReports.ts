import axios from "@/lib/axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const [reports, setReports] = useState<ReceivingReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await axios.get("/requests/receiving-reports/unapproved/");
      setReports(res.data.results || []);
    } catch (err) {
      setIsError(true);
      toast.error("Failed to fetch unapproved receiving reports.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    reports,
    isLoading,
    isError,
    refetch: fetchData,
  };
}

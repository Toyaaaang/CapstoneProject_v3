// hooks/receiving/usePendingDeliveries.ts
import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export interface PendingDeliveryPO {
  id: number;
  po_number: string;
  supplier: string;
  delivery_date: string;
  items: {
    id: number;
    material: {
      name: string;
    };
    quantity: number;
    unit: string;
    delivery_status: string;
    requires_certification: boolean;
    is_certified: boolean;
  }[];
}

export default function usePendingDeliveries() {
  const [data, setData] = useState<PendingDeliveryPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/requests/receiving-reports/pending-pos/");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch pending POs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, refetch: fetchData };
}

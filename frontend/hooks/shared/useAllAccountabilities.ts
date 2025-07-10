import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export interface AccountabilityItem {
  material: {
    name: string;
    unit: string;
  };
  quantity: number;
  unit: string;
  charge_ticket?: string | null;
}

export interface Accountability {
  id: number;
  user: string;
  department: string;
  created_at: string;
  items: AccountabilityItem[];
}

export default function useAllAccountabilities() {
  const [data, setData] = useState<Accountability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/accountability/");
      setData(res.data.results || []);
    } catch (err) {
      console.error("Error fetching accountabilities", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

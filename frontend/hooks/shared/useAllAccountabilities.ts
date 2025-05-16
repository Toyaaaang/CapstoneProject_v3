import useSWR from "swr";
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
  created_at: string;
  items: AccountabilityItem[];
}

const fetcher = (url: string) =>
  axios.get(url).then((res) => res.data.results || []);  // ✅ correctly reads paginated results

export default function useAllAccountabilities() {
  const { data, error, isLoading, mutate } = useSWR<Accountability[]>(
    "/accountability/",
    fetcher
  );

  return {
    data: data ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
}

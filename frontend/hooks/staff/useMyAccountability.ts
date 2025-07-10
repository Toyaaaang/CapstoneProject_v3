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
  user: string; // full name
  created_at: string;
  items: AccountabilityItem[];
}

const fetcher = (url: string) =>
  axios.get(url).then((res) => res.data);

export default function useMyAccountability() {
  const { data, error, isLoading, mutate } = useSWR<Accountability[]>(
    "/accountability/my_accountability/",
    fetcher
  );

  return {
    data: data ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
}

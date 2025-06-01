import useSWR from "swr";
import axios from "@/lib/axios";
import { toast } from "sonner"; // optional

const pageSize = 8;

export const usePendingChargeTicketsAdmin = (page: number) => {
  const { data, isLoading, mutate, error } = useSWR(
    `/requests/charge-tickets/pending_admin_approval/?page=${page}&page_size=${pageSize}`,
    async (url) => {
      try {
        const res = await axios.get(url);
        const raw = res.data;

        const transformedResults = raw.results.map((ticket: any) => ({
          ...ticket,
          items: (ticket.items || []).map((item: any) => ({
            material_name: item.material?.name || item.custom_name || "Custom Item",
            quantity: item.quantity,
            unit: item.unit,
          })),
        }));

        return {
          ...raw,
          results: transformedResults,
        };
      } catch (err) {
        console.error("Failed to fetch charge tickets:", err);
        toast.error("Failed to load charge tickets.");
        return { results: [], count: 0 };
      }
    }
  );

  return {
    data: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    isError: !!error,
    refetch: mutate,
  };
};

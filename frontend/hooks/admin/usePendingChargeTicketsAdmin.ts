import useSWR from "swr";
import axios from "@/lib/axios";

const pageSize = 8;

export const usePendingChargeTicketsAdmin = (page: number) => {
  const { data, isLoading, mutate } = useSWR(
    `/requests/charge-tickets/pending_admin_approval/?page=${page}&page_size=${pageSize}`,
    async (url) => {
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
    }
  );

  return {
    data: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    refetch: mutate,
  };
};

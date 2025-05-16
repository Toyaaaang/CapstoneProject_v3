import useSWR from "swr";
import axios from "@/lib/axios";

const pageSize = 8;

export const usePendingChargeReleasesStaff = (page: number) => {
  const { data, isLoading, mutate } = useSWR(
    `/requests/charge-tickets/pending_release/?page=${page}&page_size=${pageSize}`,
    (url) => axios.get(url).then((res) => res.data)
  );

  return {
    data: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    refetch: mutate,
  };
};

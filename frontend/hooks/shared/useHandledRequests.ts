import useSWR from "swr";
import axios from "@/lib/axios";

export const useHandledRequests = (page: number) => {
  const pageSize = 8;

  const { data, isLoading, mutate } = useSWR(
    `/requests/material-requests/handled_requests/?page=${page}&page_size=${pageSize}`,
    (url) => axios.get(url).then((res) => res.data)
  );

  return {
    data: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    refetch: mutate,
  };
};

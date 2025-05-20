import useSWR from "swr";
import axios from "@/lib/axios";

const fetchReadyDeliveries = async () => {
  const { data } = await axios.get("/requests/receiving-reports/deliveries/");
  return data.results; // ✅ extract from paginated response
};

export default function useReadyDeliveriesForRR() {
  const { data, error, isLoading, mutate } = useSWR(
    "/requests/receiving-reports/deliveries/", // ✅ must match above
    fetchReadyDeliveries
  );

  return {
    deliveries: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export function useMaterialRequests() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/requests/my-material-requests/");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, refetch: fetchData };
}

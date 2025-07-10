import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";

export const useEvaluatableRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    setLoading(true);
    axios
      .get("/requests/material-requests/view/?status=pending")
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        toast.error("Failed to load requests.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    data,
    loading,
    refetch: fetchRequests,
  };
};

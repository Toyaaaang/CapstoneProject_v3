import { useState, useEffect } from "react";
import axios from "@/lib/axios"; // ✅ uses your axios config with cookies
import { toast } from "sonner";

type ApprovalHistory = {
  id: number;
  user_username: string;
  requested_role: string;
  status: string;
  processed_by_username: string;
  processed_at: string;
};

export const useApprovalHistory = () => {
  const [data, setData] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const fetchApprovalHistory = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<{
        results: ApprovalHistory[];
        count: number;
      }>(`authentication/approval-history/?page=${currentPage}`);
      setData(response.data.results);
      setTotalCount(response.data.count);
    } catch (err) {
      setError("Failed to fetch approval history.");
      toast.error("Failed to fetch approval history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalHistory(page);
  }, [page]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    totalCount,
    fetchApprovalHistory,
  };
};

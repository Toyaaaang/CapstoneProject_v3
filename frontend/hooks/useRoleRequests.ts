import { useState, useEffect } from "react";
import axios from "@/lib/axios"; // ✅ your configured axios with withCredentials
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type RoleRequest = {
  id: number;
  full_name: string;
  role: string;
  date_joined: string;
  is_role_confirmed: boolean;
};

export const useRoleRequests = () => {
  const [data, setData] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const router = useRouter();

  const fetchRoleRequests = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ results: RoleRequest[]; count: number }>(
        `authentication/pending-roles/?page=${currentPage}`
      );
      setData(response.data.results);
      setTotalCount(response.data.count);
    } catch (err) {
      setError("Failed to fetch role requests.");
      toast.error("Failed to fetch role requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveRoleRequest = async (id: number) => {
    try {
      const response = await axios.post(`authentication/accept-role/${id}/`);
      toast.success(response.data.message);
      fetchRoleRequests(page);
      await pushToRoleHistory(id);
      router.push(`/pages/admin/role-history`);
    } catch (err) {
      toast.error("Error approving role.");
      console.error(err);
    }
  };

  const rejectRoleRequest = async (id: number) => {
    try {
      const response = await axios.post(`authentication/reject-role/${id}/`);
      toast.success(response.data.message);
      fetchRoleRequests(page);
      await pushToRoleHistory(id);
      router.push(`/pages/admin/role-history`);
    } catch (err) {
      toast.error("Error rejecting role.");
      console.error(err);
    }
  };

  const pushToRoleHistory = async (_id: number) => {
    try {
      await axios.post(`authentication/role-history/`);
    } catch {
      // Silently fail — optional to toast
    }
  };

  useEffect(() => {
    fetchRoleRequests(page);
  }, [page]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    totalCount,
    fetchRoleRequests,
    approveRoleRequest,
    rejectRoleRequest,
  };
};

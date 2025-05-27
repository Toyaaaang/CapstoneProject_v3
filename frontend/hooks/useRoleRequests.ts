import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/config";
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

  const getAccessToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  };

  const accessToken = getAccessToken();

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  const fetchRoleRequests = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{
        results: RoleRequest[];
        count: number;
      }>(
        `api/authentication/pending-roles/?page=${currentPage}`
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
      const response = await axiosInstance.post(`api/authentication/accept-role/${id}/`);
      const data = response.data as { message: string };
      toast.success(data.message);
      fetchRoleRequests(page); // Refresh current page
      await pushToRoleHistory(id);
      router.push(`/pages/admin/role-history`);
    } catch (err) {
      toast.error("Error approving role.");
      console.error("Error approving role:", err);
    }
  };

  const rejectRoleRequest = async (id: number) => {
    try {
      const response = await axiosInstance.post(`api/authentication/reject-role/${id}/`);
      const data = response.data as { message: string };
      toast.success(data.message);
      fetchRoleRequests(page); // Refresh current page
      await pushToRoleHistory(id);
      router.push(`/pages/admin/role-history`);
    } catch (err) {
      toast.error("Error rejecting role.");
      console.error("Error rejecting role:", err);
    }
  };

  const pushToRoleHistory = async (id: number) => {
    try {
      await axiosInstance.post(`api/authentication/role-history/`);
    } catch (err) {
      // Silent fail
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

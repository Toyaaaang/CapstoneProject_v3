import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/config";
import { toast } from "sonner"; // Import the toast function
import { useRouter } from "next/navigation"; // Import useRouter for navigation

type RoleRequest = {
  id: number;
  username: string;
  role: string;
  date_joined: string;
  is_role_confirmed: boolean;
};

export const useRoleRequests = () => {
  const [data, setData] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize the router

  // Get the access token from localStorage or another secure storage
  const getAccessToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  };

  const accessToken = getAccessToken();

  // Axios instance with Authorization header
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  // Fetch role requests
  const fetchRoleRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("api/authentication/pending-roles/");
      setData(response.data as RoleRequest[]);
    } catch (err) {
      setError("Failed to fetch role requests.");
      toast.error("Failed to fetch role requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Approve a role request
  const approveRoleRequest = async (id: number) => {
    try {
      const response = await axiosInstance.post(`api/authentication/accept-role/${id}/`);
      const message = (response.data as { message: string }).message;
      toast.success(message);

      // Remove the approved request from the pending list
      setData((prevData) => prevData.filter((request) => request.id !== id));

      // Push to role history
      await pushToRoleHistory(id);

      // Navigate to role history page
      router.push(`/pages/admin/role-history`);
    } catch (err) {
      toast.error("Error approving role.");
      console.error("Error approving role:", err);
    }
  };

  // Reject a role request
  const rejectRoleRequest = async (id: number) => {
    try {
      const response = await axiosInstance.post(`api/authentication/reject-role/${id}/`);
      const message = (response.data as { message: string }).message;
      toast.success(message);

      // Remove the rejected request from the pending list
      setData((prevData) => prevData.filter((request) => request.id !== id));

      // Push to role history
      await pushToRoleHistory(id);

      // Navigate to role history page
      router.push(`/pages/admin/role-history`);
    } catch (err) {
      toast.error("Error rejecting role.");
      console.error("Error rejecting role:", err);
    }
  };

  // Push to role history
  const pushToRoleHistory = async (id: number) => {
    try {
      await axiosInstance.post(`api/authentication/role-history/`);
      // toast.success("Role history updated successfully.");
    } catch (err) {
      // toast.error("Error updating role history.");
      // console.error("Error updating role history:", err);
    }
  };

  useEffect(() => {
    fetchRoleRequests();
  }, []);

  return { data, loading, error, fetchRoleRequests, approveRoleRequest, rejectRoleRequest };
};
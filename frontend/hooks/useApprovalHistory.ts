import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/config";
import { toast } from "sonner";

type ApprovalHistory = {
  id: number;
  user_username: string; // Username of the user whose role request was processed
  requested_role: string; // The role requested by the user
  status: string; // "approved" or "rejected"
  processed_by_username: string; // Username of the admin who processed the request
  processed_at: string; // Timestamp of when the request was processed
};

export const useApprovalHistory = () => {
  const [data, setData] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch approval history
  const fetchApprovalHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("api/authentication/approval-history/");
      setData(response.data as ApprovalHistory[]);
    } catch (err) {
      setError("Failed to fetch approval history.");
      toast.error("Failed to fetch approval history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalHistory();
  }, []);

  return { data, loading, error, fetchApprovalHistory };
};
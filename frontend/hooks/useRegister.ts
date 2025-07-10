import axios from "axios";
import { useState } from "react";
import { API_BASE_URL } from "@/utils/config";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
  first_name: string;  // ✅ Added
  last_name: string;   // ✅ Added
}

interface UseRegisterReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  register: (data: RegisterData) => Promise<void>;
}

export default function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(`${API_BASE_URL}api/authentication/register/`, data);
      if (response.status === 201) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, success, register };
}

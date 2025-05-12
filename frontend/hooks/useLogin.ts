import { useState } from "react";
import { useRouter } from "next/navigation"; // For navigation
import { toast } from "sonner"; // For toast notifications
import { API_BASE_URL } from "@/utils/config";
import { jwtDecode } from "jwt-decode"; // For decoding JWT tokens

interface LoginData {
  identifier: string; // Can be username or email
  password: string;
}

interface UseLoginReturn {
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
}

export default function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async ({ identifier, password }: LoginData) => {
    if (!identifier || !password) {
      toast.error("Login failed", {
        description: "Username/email and password are required.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}api/authentication/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(responseData.detail || "Invalid credentials. Please try again.");
        } else if (response.status === 401) {
          throw new Error("Unauthorized access. Please check your credentials.");
        } else if (response.status === 403) {
          throw new Error("Your account has not been verified yet.");
        }
        throw new Error("Something went wrong. Please try again.");
      }

      // Prevent login if role is not confirmed
      if (!responseData.is_role_confirmed) {
        toast.error("Login blocked", {
          description: "Your role has not been verified by the admin. Please wait for confirmation.",
        });
        return;
      }

      // Store tokens and user info in local storage
      localStorage.setItem("access_token", responseData.access);
      localStorage.setItem("refresh_token", responseData.refresh);
      localStorage.setItem("role", responseData.role);
      localStorage.setItem("is_role_confirmed", JSON.stringify(responseData.is_role_confirmed));

      // Decode the token to extract user information (optional)
      const decoded = jwtDecode(responseData.access);
      console.log("Decoded token:", decoded);

      // Show success toast
      toast.success("Login successful", {
        description: `Please wait. Redirecting to your dashboard...`,
      });

      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        warehouse_admin: "/pages/admin",
        warehouse_staff: "/pages/warehouse_staff",
        budget_analyst: "/pages/budget",
        engineering: "/pages/engineering",
        operations_maintenance: "/pages/operations-maintenance",
        manager: "/pages/gen-manager",
        employee: "/pages/employee",
        finance: "/pages/finance",
        sub_office: "/pages/sub-offices",
        audit: "/pages/audit",



      };

      router.push(roleRoutes[responseData.role] || "/pages/employee");
    } catch (err: any) {
      console.error("Login failed:", err.message);
      setError(err.message);
      toast.error("Login failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, login };
}
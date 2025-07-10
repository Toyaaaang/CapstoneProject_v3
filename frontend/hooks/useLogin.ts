import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { API_BASE_URL } from "@/utils/config";

interface LoginData {
  identifier: string;
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
  const { reconnect } = useNotifications();

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
        credentials: "include",
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.detail || "Login failed. Try again.");
      }

      // 🔄 Now fetch user data from /me/
      const meRes = await fetch(`${API_BASE_URL}api/authentication/me/`, {
        credentials: "include",
      });

      const meData = await meRes.json();
      // console.log("User data:", meData);
      if (!meData.is_role_confirmed) {
        toast.error("Login blocked", {
          description: "Your role has not been verified by the admin.",
        });
        return;
      }
      reconnect();

      toast.success("Login successful", {
        description: "Redirecting to your dashboard...",
      });

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

      router.push(roleRoutes[meData.role] || "/pages/employee");
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

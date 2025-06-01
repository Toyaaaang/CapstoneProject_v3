"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL } from "@/utils/config";

export default function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/authentication/logout/`, {
        method: "POST",
        credentials: "include", // 🔥 Important: include cookies!
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to log out.");
      }

      toast.info("Logging out...", {
        description: "You will be redirected shortly.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (err: any) {
      console.error("Logout failed:", err);
      toast.error("Logout failed", {
        description: err.message || "Unexpected error occurred.",
      });
    }
  };

  return { logout };
}

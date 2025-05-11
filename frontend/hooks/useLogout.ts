"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL } from "@/utils/config";

export default function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const accessToken = localStorage.getItem("access_token");

      if (!refreshToken) {
        throw new Error("No refresh token found. Please log in again.");
      }

      // Call the backend logout endpoint to blacklist the refresh token
      const response = await fetch(`${API_BASE_URL}api/authentication/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Include the access token
        },
        body: JSON.stringify({ refresh: refreshToken }), // Send refresh token in the body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log out from the server.");
      }

      // Clear tokens and user info from local storage
      localStorage.clear();

      // Redirect to the login page after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 500);

      // Show success toast
      toast.info("Logging out...", {
        description: "You will be redirected shortly.",
      });    } catch (err: any) {
      console.error("Logout failed:", err.message);
      toast.error("Logout failed", { description: err.message });
    }
  };

  return { logout };
}
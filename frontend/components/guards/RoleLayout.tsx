"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

export default function RoleLayout({
  allowedRole,
  children,
}: {
  allowedRole: string;
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/authentication/me/");
        const userRole = res.data.role;
        const isConfirmed = res.data.is_role_confirmed;

        if (userRole === allowedRole && isConfirmed) {
          setAuthorized(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        router.replace("/unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [allowedRole, router]);

  if (loading || !authorized) return null;

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RoleLayout({
  allowedRole,
  children,
}: {
  allowedRole: string;
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role === allowedRole) {
      setAuthorized(true);
    } else {
      router.replace("/unauthorized");
    }
  }, [allowedRole, router]);

  if (!authorized) return null;

  return <>{children}</>;
}

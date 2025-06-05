"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FilterConfig = {
  search: string;
  status: string;
  role: string;
};

export default function RoleHistoryFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<FilterConfig>({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    role: searchParams.get("role") || "",
  });

  // Update URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.role) params.set("role", filters.role);

    params.set("page", "1"); // reset to page 1
    router.push(`?${params.toString()}`);
  }, [filters, router]);

  const handleChange = (key: keyof FilterConfig, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Search Input */}
      <Input
        placeholder="Search by username"
        value={filters.search}
        onChange={(e) => handleChange("search", e.target.value)}
        className="w-[200px]"
      />

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => handleChange("status", value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {/* Role Filter */}
      <Select
        value={filters.role}
        onValueChange={(value) => handleChange("role", value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="employee">Employee</SelectItem>
          <SelectItem value="warehouse_admin">Warehouse Admin</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

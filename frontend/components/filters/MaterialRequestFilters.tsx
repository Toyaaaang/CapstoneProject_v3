"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type FilterConfig = {
  status: string;
  work_order_no: string;
};

export default function MaterialRequestFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<FilterConfig>({
    status: searchParams.get("status") || "all",
    work_order_no: searchParams.get("work_order_no") || "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.work_order_no) params.set("work_order_no", filters.work_order_no);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [filters, router]);

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Select
        value={filters.status}
        onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Work Order No."
        value={filters.work_order_no}
        onChange={(e) => setFilters((prev) => ({ ...prev, work_order_no: e.target.value }))}
        className="w-[200px]"
      />
    </div>
  );
}
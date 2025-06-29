"use client";

import usePersonalAccountability from "@/hooks/staff/useMyAccountability";
import { columns, FlattenedAccountabilityItem } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import { useState } from "react";

export default function PersonalAccountabilityPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, totalCount, refetch } = usePersonalAccountability({ page, pageSize });

  // Flatten data: 1 row per material item
  const flattenedData: FlattenedAccountabilityItem[] = data.flatMap((acc) =>
    acc.items.map((item) => ({
      id: acc.id,
      created_at: acc.created_at,
      material_name: item.material.name,
      category: item.material.category,
      quantity: Number(item.quantity),
      unit: item.unit,
      // Use ic_no if present, otherwise mc_no
      charge_ticket_number: item.charge_ticket?.ic_no || item.charge_ticket?.mc_no || "-",
      department: acc.department,
    }))
  );

  return (
    <div className="p-6 space-y-4">
      <DataTable
        title="My Accountabilities"
        columns={columns}
        data={flattenedData}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        totalCount={totalCount}
        refreshData={refetch}
      />
    </div>
  );
}

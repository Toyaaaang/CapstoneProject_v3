"use client";

import { useState } from "react";
import useAllAccountabilities from "@/hooks/shared/useAllAccountabilities";
import { columns } from "./columns";
import { AccountabilityRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function AccountabilityPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useAllAccountabilities();

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  const formattedData: AccountabilityRecord[] = paginatedData.map((acc) => ({
    id: acc.id,
    user: acc.user,
    created_at: acc.created_at,
    items: acc.items.map((item) => ({
      material: {
        name: item.material.name,
        unit: item.material.unit,
      },
      quantity: item.quantity,
      unit: item.unit,
    })),
  }));

  return (
    <div className="p-6 space-y-4">
      <DataTable
        title="All Assigned Accountabilities"
        columns={columns}
        data={formattedData}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        totalCount={data.length}
        pageSize={pageSize}
      />
    </div>
  );
}

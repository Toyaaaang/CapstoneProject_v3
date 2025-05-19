"use client";

import { useState } from "react";
import useAuditPOs from "@/hooks/audit/useAuditPOs";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function AuditPORecommendationPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, totalCount, refetch } = useAuditPOs(page, pageSize);

  return (
    <div className="p-6 space-y-4">
      <DataTable
        title="Pending Purchase Orders"
        columns={columns}
        data={data}
        page={page}
        setPage={setPage}
        totalCount={totalCount}
        isLoading={isLoading}
        refreshData={refetch}
        meta={{ refreshData: refetch }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import DataTable from "@/components/Tables/DataTable";
import useReadyDeliveriesForRR from "@/hooks/staff/useReadyDeliveriesForRR";
import { columns } from "./columns";

export default function ReadyForReportPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { deliveries, isLoading, refresh } = useReadyDeliveriesForRR();

  const totalCount = deliveries.length;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Deliveries Ready for Receiving Report</h1>
      <DataTable
        title="Certified Deliveries"
        columns={columns}
        data={deliveries.slice((page - 1) * pageSize, page * pageSize)} // ✅ simple client-side pagination
        isLoading={isLoading}
        refreshData={refresh}
        page={page}
        setPage={setPage}
        totalCount={totalCount}
        pageSize={pageSize}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { columns } from "./columns";
import useDeliveriesForReceiving from "@/hooks/staff/useDeliveriesForReceiving";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";

export default function ReceivingReportPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, totalCount, refetch } = useDeliveriesForReceiving({
    page,
    pageSize,
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Create Receiving Report</h1>
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Validated Deliveries"
          columns={columns}
          data={data}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          refreshData={refetch}
        />
      )}
    </div>
  );
}

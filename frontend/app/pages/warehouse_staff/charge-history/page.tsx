"use client";

import { useState } from "react";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { columns } from "./columns";
import { useReleasedChargeTicketsStaff } from "@/hooks/staff/useReleasedChargeTicketsStaff";

export default function ReleasedChargeTicketsHistoryPage() {
  const [page, setPage] = useState(1);
  const {
    data,
    totalCount,
    isLoading,
    refetch,
  } = useReleasedChargeTicketsStaff(page);

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Released Charge Tickets – History"
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
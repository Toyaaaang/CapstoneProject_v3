"use client";

import { useState } from "react";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { usePendingChargeReleasesStaff } from "@/hooks/staff/usePendingChargeReleasesStaff";

export default function ReleaseChargeTicketsPage() {
  const [page, setPage] = useState(1);
  const {
    data,
    totalCount,
    isLoading,
    refetch,
  } = usePendingChargeReleasesStaff(page);

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Charge Tickets – Ready for Release"
          columns={columns({ refreshData: refetch })}
          data={data}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          refreshData={refetch}
          meta={{ refreshData: refetch }}
        />
      )}
    </div>
  );
}

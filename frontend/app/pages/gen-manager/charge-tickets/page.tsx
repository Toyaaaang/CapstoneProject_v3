"use client";

import { useState } from "react";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { usePendingChargeTicketsGM } from "@/hooks/manager/usePendingChargeTicketsGM";

export default function GMChargeApprovalPage() {
  const [page, setPage] = useState(1);
  const {
    data,
    totalCount,
    isLoading,
    refetch,
  } = usePendingChargeTicketsGM(page);

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Charge Ticket Requests – Approval"
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

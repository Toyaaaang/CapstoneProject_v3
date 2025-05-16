"use client";

import { useState } from "react";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { usePendingChargeTicketsAdmin } from "@/hooks/admin/usePendingChargeTicketsAdmin";

export default function AdminChargeApprovalPage() {
  const [page, setPage] = useState(1);
  const { data, totalCount, isLoading, refetch } = usePendingChargeTicketsAdmin(page);

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Warehouse Admin – Charge Ticket Approvals"
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

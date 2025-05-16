"use client";

import { useState } from "react";
import useBudgetRVHistory from "@/hooks/budget/useBudgetRVHistory";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";

export default function BudgetRVHistoryPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, totalCount, refetch } = useBudgetRVHistory(page, pageSize);

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Requisition Voucher History"
          columns={columns}
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

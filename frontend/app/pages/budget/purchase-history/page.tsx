"use client";

import { useState } from "react";
import usePurchaseHistory from "@/hooks/budget/usePurchaseHistory";
import DataTable from "@/components/Tables/DataTable";
import { purchaseHistoryColumns as columns } from "./columns";
import TableLoader from "@/components/Loaders/TableLoader";

export default function PurchaseHistoryPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, totalCount, refetch } = usePurchaseHistory(page, pageSize);

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Purchase History"
          columns={columns}
          data={data}
          refreshData={refetch}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}

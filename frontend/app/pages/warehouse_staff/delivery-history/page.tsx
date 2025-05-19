"use client";

import { useState } from "react";
import useDeliveredPOs from "@/hooks/staff/useDeliveredPOs";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";

export default function DeliveredPOHistoryPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, totalCount, refetch } = useDeliveredPOs(page, pageSize);

  return (
    <div className="p-4 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Deliveries History"
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

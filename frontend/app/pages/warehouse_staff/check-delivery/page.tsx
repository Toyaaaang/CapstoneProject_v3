"use client";

import { useState } from "react";
import useFinalApprovedPOs from "@/hooks/staff/useFinalApprovedPOs";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";

export default function DeliveryValidationPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, totalCount, refetch } = useFinalApprovedPOs(page, pageSize);

  return (
    <div className="p-4 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Pending Deliveries"
          columns={columns}
          data={data}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          refreshData={refetch}
          meta={{
            refreshData: refetch,}}
        />
      )}
    </div>
  );
}

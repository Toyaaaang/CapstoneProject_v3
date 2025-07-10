"use client";

import { useState } from "react";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { columns } from "./columns";
import useGMPOApprovals from "@/hooks/manager/useGMPOApprovals";

export default function GMPOApprovalPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data,
    isLoading,
    totalCount,
    refetch,
  } = useGMPOApprovals(page, pageSize);

  if (isLoading) return <TableLoader />;

  return (
    <div className="p-4 space-y-4">
      <DataTable
        title="Purchase Orders - Final Approval"
        columns={columns}
        data={data}
        page={page}
        setPage={setPage}
        totalCount={totalCount}
        refreshData={refetch}
        meta={{
          refreshData: refetch,}}
      />
    </div>
  );
}

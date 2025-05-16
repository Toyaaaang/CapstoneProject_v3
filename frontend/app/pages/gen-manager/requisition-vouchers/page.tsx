"use client";

import { useState } from "react";
import useGMRequisitionVouchers from "@/hooks/manager/useGMRequisitionVouchers";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";

export default function GMRequisitionApprovalPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, totalCount, refetch } = useGMRequisitionVouchers(page, pageSize);

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Requisition Vouchers - For Final Approval"
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

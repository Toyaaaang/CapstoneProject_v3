"use client";

import { useState } from "react";
import DataTable from "@/components/Tables/DataTable";
import { columns } from "./columns";
import useUnapprovedReceivingReports from "@/hooks/admin/useUnapprovedReceivingReports";

export default function RRApprovalPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { reports, isLoading, refetch } = useUnapprovedReceivingReports();

  const totalCount = reports.length;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Receiving Reports for Approval</h1>
      <DataTable
        title="Unapproved Reports"
        columns={columns}
        data={reports.slice((page - 1) * pageSize, page * pageSize)}
        isLoading={isLoading}
        refreshData={refetch}
        page={page}
        setPage={setPage}
        totalCount={totalCount}
        pageSize={pageSize}
      />
    </div>
  );
}

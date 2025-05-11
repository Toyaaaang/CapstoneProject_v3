"use client";

import { useGMApprovals } from "@/hooks/useGMApprovals";
import { columns as gmColumns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function GMApprovalPage() {
  const { data, loading, error, refetch, handleAction } = useGMApprovals();

  if (loading) {
    return (
      <div className="p-4">
        <TableLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <DataTable
        title="RV Final Approval"
        description="Final review of restock requests approved by Budget"
        columns={gmColumns(handleAction)}
        data={data}
        searchKey="reference_no"
        refreshData={refetch}
      />
    </div>
  );
}

"use client";
import { useGMPOApprovals } from "@/hooks/useGMPOApprovals";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import TableLoader from "@/components/Loaders/TableLoader";

export default function GMPurchaseOrderPage() {
  const { data, loading, error, handleAction, refetch } = useGMPOApprovals();

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
        title="Pending Purchase Orders"
        description="Approve or reject submitted POs"
        columns={columns(handleAction)}
        data={data}
        searchKey="reference_no"
        refreshData={refetch}
      />
    </div>
  );
}

"use client";

import { useBudgetRestockApprovals } from "@/hooks/useBudgetRestockApprovals";
import { columns as budgetColumns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function BudgetRestockPage() {
  const { data, loading, error, refetch, handleAction } = useBudgetRestockApprovals();

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
          <AlertDescription>Failed to load data: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <DataTable
        title="Pending Restock Requests"
        description="Approve or reject restocking requests from departments"
        columns={budgetColumns(handleAction)}
        data={data}
        searchKey="reference_no"
        refreshData={refetch}
      />
    </div>
  );
}

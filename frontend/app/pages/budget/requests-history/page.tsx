"use client";

// import { useBudgetHistory } from "@/hooks/useBudgetHistory";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function BudgetRestockHistoryPage() {
  const { data, loading, error, refetch } = useBudgetHistory();

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
        title="Budget Restock Request History"
        description="Track previously reviewed requests"
        columns={columns}
        data={data}
        searchKey="reference_no"
        refreshData={refetch}
      />
    </div>
  );
}

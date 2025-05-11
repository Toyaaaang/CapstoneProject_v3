"use client";

import { useSearchParams } from "next/navigation"; // Import useSearchParams
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { columns } from "./columns";
import { useApprovalHistory } from "@/hooks/useApprovalHistory";

export default function RoleHistoryPage() {
  const { data, loading, error } = useApprovalHistory();
  const searchParams = useSearchParams(); // Get query parameters

  if (loading) {
    return <TableLoader />;
    }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <DataTable
        title="Approval History"
        columns={columns}
        data={data}
      />
    </div>
  );
}
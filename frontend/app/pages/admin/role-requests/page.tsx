"use client";

import DataTable from "@/components/Tables/DataTable";
import { columns } from "./columns";
import { useRoleRequests } from "@/hooks/useRoleRequests";
import TableLoader from "@/components/Loaders/TableLoader";

export default function RoleRequestsPage() {
  const { data, loading, error } = useRoleRequests();

  if (loading) {
    return <TableLoader />;
    }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <DataTable title="Role Requests" columns={columns} data={data} />
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useMaterialRequests } from "@/hooks/employee/useMaterialRequests";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import { Button } from "@/components/ui/button";
import TableLoader from "@/components/Loaders/TableLoader";

export default function MaterialRequestHistoryPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useMaterialRequests();

  return (
    <div className="p-4 space-y-4">

      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Requests History"
          columns={columns}
          data={data}
          refreshData={refetch}
        />
      )}

      <div className="flex justify-between items-center">
        <Button onClick={() => router.push("/pages/employee/requests/")}>
          + New Request
        </Button>
      </div>
    </div>
  );
}

"use client";

import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import useQCHistory from "@/hooks/shared/useQCHistory";
import { useState } from "react";
import TableLoader from "@/components/Loaders/TableLoader";

export default function QualityCheckHistoryPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, totalCount, refetch } = useQCHistory(page, pageSize);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Quality Check History</h1>
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="QC Records"
          columns={columns}
          data={data}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          refreshData={refetch}
        />
      )}
    </div>
  );
}

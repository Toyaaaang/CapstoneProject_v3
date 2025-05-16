"use client";

import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { useState } from "react";
import { useEngineerEvaluations } from "@/hooks/engineer/useEngineerEvaluations";

export default function EvaluationPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, totalCount, refetch } = useEngineerEvaluations(page);

  return (
    <div className="p-4 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Pending Material Requests"
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

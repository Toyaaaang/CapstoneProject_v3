"use client";

import { useState } from "react";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import useQualityCheckPOs from "@/hooks/shared/useQualityCheckPOs";
import TableLoader from "@/components/Loaders/TableLoader";

export default function QualityCheckPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, totalCount, refetch } = useQualityCheckPOs(page, pageSize);

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Pending Quality Checks"
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

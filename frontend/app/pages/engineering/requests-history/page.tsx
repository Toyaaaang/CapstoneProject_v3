"use client";

import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import { useState } from "react";
import TableLoader from "@/components/Loaders/TableLoader";
import useDepartmentalRVHistory from "@/hooks/shared/useDepartmentalRVHistory"; // ✅ make sure path matches your project

export default function DepartmentalRVHistoryPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, totalCount, refetch } = useDepartmentalRVHistory(page, pageSize);

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Departmental RV History"
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

"use client";

import { useState } from "react";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import { useHandledRequests } from "@/hooks/shared/useHandledRequests";

export default function HandledRequestsPage() {
  const [page, setPage] = useState(1);
  const { data, totalCount, isLoading, refetch } = useHandledRequests(page);

  return (
    <div className="p-4 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Evaluation History"
          columns={columns}
          data={data}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          refreshData={refetch}
          meta={{ refreshData: refetch }}
        />
      )}
    
    </div>
  );
}

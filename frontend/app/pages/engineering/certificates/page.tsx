"use client";

import { useState } from "react";
import useCertificationsToCreate from "@/hooks/shared/useCertificationsToCreate";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";

export default function CertificationCreatePage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, refetch, totalCount } = useCertificationsToCreate({
    page,
    pageSize,
  });

  return (
    <div className="p-6 space-y-4">

      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Pending Certifications"
          columns={columns}
          data={data}
          refreshData={refetch}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          pageSize={pageSize}
          meta={{
            refreshData: refetch,
          }}
        />
      )}
    </div>
  );
}

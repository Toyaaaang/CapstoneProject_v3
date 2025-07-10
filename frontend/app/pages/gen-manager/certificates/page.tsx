// app/(dashboard)/certifications/gm/page.tsx
"use client";

import useCertificationsForGM from "@/hooks/manager/useCertificationsForGM";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";

export default function GMApprovalPage() {
  const {
    data,
    isLoading,
    refetch,
    page,
    setPage,
    totalCount,
  } = useCertificationsForGM();

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Pending Certifications for Final Approval"
          columns={columns}
          data={data}
          refreshData={refetch}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
        />
      )}
    </div>
  );
}

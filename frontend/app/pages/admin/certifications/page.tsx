"use client";

import useCertificationsForAdmin from "@/hooks/admin/useCertificationsForAdmin";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";

export default function AdminCertificationApprovalPage() {
  const {
    data,
    isLoading,
    refetch,
    page,
    setPage,
    totalCount,
  } = useCertificationsForAdmin();

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
        />
      )}
    </div>
  );
}

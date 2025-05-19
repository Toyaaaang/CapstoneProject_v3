"use client";

import useCertificationsForAudit from "@/hooks/audit/useCertificationsForAudit";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";

export default function AuditCertificationPage() {
  const { data, isLoading, refetch } = useCertificationsForAudit();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Audit Certification Approvals</h1>

      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="Pending Certifications"
          columns={columns}
          data={data}
          refreshData={refetch}
          page={1}
          setPage={() => {}}
          totalCount={data.length}
        />
      )}
    </div>
  );
}

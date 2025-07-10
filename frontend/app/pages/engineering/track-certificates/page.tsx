"use client";

import DataTable from "@/components/Tables/DataTable";
import TableLoader from "@/components/Loaders/TableLoader";
import useCertificationMonitoring from "@/hooks/shared/useCertificationMonitoring";
import { columns } from "./columns";

export default function CertificationMonitoringPage() {
  const { data, isLoading, refetch } = useCertificationMonitoring();

  return (
    <div className="p-6 space-y-4">
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          title="All Certifications"
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

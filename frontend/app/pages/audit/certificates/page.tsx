"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { PendingCertificationForAudit } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function AuditorCertificationApprovalPage() {
  const [data, setData] = useState<PendingCertificationForAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/auditor/certifications/pending/"); // Adjust endpoint as needed
      setData(res.data);
    } catch (err) {
      console.error("Failed to load certifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Certification Approvals" columns={columns({ refreshData: fetchData })} data={data} isLoading={loading} />
    </div>
  );
}

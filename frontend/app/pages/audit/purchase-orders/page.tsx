"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { PendingPOForAudit } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function AuditorPOApprovalPage() {
  const [data, setData] = useState<PendingPOForAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/auditor/po/pending/"); // Adjust endpoint if needed
      setData(res.data);
    } catch (err) {
      console.error("Failed to load pending POs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable
        title="Pending Purchase Orders"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

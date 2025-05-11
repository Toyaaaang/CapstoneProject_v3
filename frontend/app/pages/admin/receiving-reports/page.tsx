"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { PendingReceivingReport } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function ReceivingReportApprovalPage() {
  const [data, setData] = useState<PendingReceivingReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse-admin/receiving-reports/pending/"); // Adjust endpoint as needed
      setData(res.data);
    } catch (err) {
      console.error("Failed to load pending RRs", err);
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
        title="Pending Receiving Report Approvals"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

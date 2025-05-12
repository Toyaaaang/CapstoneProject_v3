"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { AuditorApprovalRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function AuditorApprovalHistoryPage() {
  const [data, setData] = useState<AuditorApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/auditor/approval/history/"); // Adjust this endpoint as needed
      setData(res.data);
    } catch (err) {
      console.error("Failed to load auditor approval history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Auditor Approval History" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

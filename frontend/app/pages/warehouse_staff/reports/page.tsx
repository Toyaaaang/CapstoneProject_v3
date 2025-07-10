"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { ReceivingReportRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function ReceivingReportHistoryPage() {
  const [data, setData] = useState<ReceivingReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse/receiving-report/history/"); // Adjust endpoint
      setData(res.data);
    } catch (err) {
      console.error("Failed to load RR history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Receiving Report History" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { ReceivingReport } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function ReceivingReportPage() {
  const [data, setData] = useState<ReceivingReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/finance/receiving-report/") // Adjust based on your endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load reports", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Receiving Report" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

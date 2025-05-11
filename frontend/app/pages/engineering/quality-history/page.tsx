"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { QualityCheckRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable"; // Adjust to your table path

export default function QualityCheckHistoryPage() {
  const [data, setData] = useState<QualityCheckRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/quality-compliance/history/") // Adjust to your endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load quality check history", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Quality Check History" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

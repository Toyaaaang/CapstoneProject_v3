"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { ReadyForRR } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function RRGenerationPage() {
  const [data, setData] = useState<ReadyForRR[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse/receiving-report/eligible/"); // adjust endpoint
      setData(res.data);
    } catch (err) {
      console.error("Failed to load POs for RR", err);
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
        title="Create Receiving Report"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

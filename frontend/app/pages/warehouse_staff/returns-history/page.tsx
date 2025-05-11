"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { ReturnRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function ReturnsHistoryPage() {
  const [data, setData] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/warehouse/returns/history/") // Adjust your endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load returns history", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable  title="Returns History (Salvage & Credit)" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

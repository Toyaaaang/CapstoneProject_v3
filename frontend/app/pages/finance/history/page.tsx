"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { FinanceRequestRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function FinanceRequestHistoryPage() {
  const [data, setData] = useState<FinanceRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/finance/request-history/") // Adjust endpoint accordingly
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load request history", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Request History (Office Supplies)" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

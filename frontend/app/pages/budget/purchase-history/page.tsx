"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { POAndPRHistoryRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function POAndPRHistoryPage() {
  const [data, setData] = useState<POAndPRHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse/purchase/history/"); // Backend should combine PO + PR history
      setData(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Purchase Order & Return History" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

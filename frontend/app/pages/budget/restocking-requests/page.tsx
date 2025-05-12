"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { PendingRV } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function RVApprovalPage() {
  const [data, setData] = useState<PendingRV[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/budget-analyst/rv/pending/"); // adjust as needed
      setData(res.data);
    } catch (err) {
      console.error("Failed to load RVs", err);
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
        title="Pending Requisition Vouchers"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

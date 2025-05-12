"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { RVApprovalRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function RVApprovalHistoryPage() {
  const [data, setData] = useState<RVApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/budget-analyst/rv/history/"); // Adjust endpoint as needed
      setData(res.data);
    } catch (err) {
      console.error("Failed to load RV approval history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Requisition Voucher Approval History" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

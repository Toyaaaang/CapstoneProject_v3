"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { GMApprovalRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function GMApprovalHistoryPage() {
  const [data, setData] = useState<GMApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/gm/approval/history/"); // Make sure this endpoint returns all types
      setData(res.data);
    } catch (err) {
      console.error("Failed to load GM approval history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Approval History" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { PendingChargeRequestForGM } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function GMChargeApprovalPage() {
  const [data, setData] = useState<PendingChargeRequestForGM[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/gm/charge-requests/pending/"); // Adjust to your actual endpoint
      setData(res.data);
    } catch (err) {
      console.error("Failed to load charge requests", err);
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
        title="Charge Requests – Final Approval"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

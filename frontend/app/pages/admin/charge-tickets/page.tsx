"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { ChargeRequestPendingApproval } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function ChargeApprovalPage() {
  const [data, setData] = useState<ChargeRequestPendingApproval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse-admin/charge-requests/pending/");
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
        title="Pending Charge Requests"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

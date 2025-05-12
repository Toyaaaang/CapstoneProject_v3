"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { PendingPurchaseReturnForAudit } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function AuditorPurchaseReturnApprovalPage() {
  const [data, setData] = useState<PendingPurchaseReturnForAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/auditor/purchase-returns/pending/"); // Adjust endpoint if needed
      setData(res.data);
    } catch (err) {
      console.error("Failed to load purchase returns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Purchase Returns – Audit Approval" columns={columns({ refreshData: fetchData })} data={data} isLoading={loading} />
    </div>
  );
}

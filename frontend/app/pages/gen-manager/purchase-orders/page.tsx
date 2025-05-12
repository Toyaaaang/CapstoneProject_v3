"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { PendingPOForGM } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function GMPOApprovalPage() {
  const [data, setData] = useState<PendingPOForGM[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/gm/po/pending/"); // Adjust to match your backend route
      setData(res.data);
    } catch (err) {
      console.error("Failed to load purchase orders", err);
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
        title="Purchase Orders - Final Approval"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

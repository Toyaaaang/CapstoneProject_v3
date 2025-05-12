"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { POWithFailedQC } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function PurchaseReturnCreatePage() {
  const [data, setData] = useState<POWithFailedQC[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse/purchase-return/eligible/"); // Adjust backend endpoint
      setData(res.data);
    } catch (err) {
      console.error("Failed to load purchase return data", err);
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
        title="Create Purchase Return"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

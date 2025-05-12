"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { RVForPOCreation } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function POCreatePage() {
  const [data, setData] = useState<RVForPOCreation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/budget-analyst/rv/final-approved/");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load final approved RVs", err);
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
        title="Create Purchase Order"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

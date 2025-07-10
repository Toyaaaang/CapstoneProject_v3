"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { SalvageReturn } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function SalvageReturnsPage() {
  const [data, setData] = useState<SalvageReturn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse/salvage-returns/pending/"); // Adjust endpoint
      setData(res.data);
    } catch (err) {
      console.error("Failed to load salvage returns", err);
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
        title="Pending Salvage Tickets"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { AccountabilityRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function AccountabilityPage() {
  const [data, setData] = useState<AccountabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse/accountabilities/all/"); // Adjust endpoint
      setData(res.data);
    } catch (err) {
      console.error("Failed to load accountabilities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold"></h1>
      <DataTable title="Accountability Management" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

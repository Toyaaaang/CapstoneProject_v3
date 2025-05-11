"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { ApprovedChargeRequest } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function ApprovedChargesPage() {
  const [data, setData] = useState<ApprovedChargeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse/approved-charges/"); // Adjust endpoint
      setData(res.data);
    } catch (err) {
      console.error("Failed to load approved charge requests", err);
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
      <DataTable title="Approved Material Charge Requests" columns={columns({ refreshData: fetchData })} data={data} isLoading={loading} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { DeliveryItem } from "./columns";
import DataTable from "@/components/Tables/DataTable"; // Adjust to your table path

export default function QualityCompliancePage() {
  const [data, setData] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/quality-compliance/pending/") // Adjust to your endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load delivery items", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold"></h1>
      <DataTable 
        title="Quality Compliance" 
        columns={columns}
        data={data}
        isLoading={loading}
       />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import DataTable from "@/components/Tables/DataTable";
import { columns } from "./columns";
import { RVRequest } from "./columns";

export default function DepartmentRVTrackingPage() {
  const [data, setData] = useState<RVRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/requests/departmental-rv/") // Adjust to your actual endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load RVs", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Departmental Requisitions" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

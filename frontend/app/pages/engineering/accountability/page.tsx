"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { DepartmentAccountabilityRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable"; // Adjust to your table path

export default function DepartmentAccountabilityPage() {
  const [data, setData] = useState<DepartmentAccountabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/accountability/department/") // Adjust to your actual endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load accountability", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Departmental Material Accountability" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { CertificationRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable"; // Adjust to your table path

export default function CertificationHistoryPage() {
  const [data, setData] = useState<CertificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/quality-compliance/certified/") // Adjust to your actual endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load certifications", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Certifications" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

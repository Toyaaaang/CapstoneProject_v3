"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { PendingCertification } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function CertificationApprovalPage() {
  const [data, setData] = useState<PendingCertification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse-admin/certifications/pending/"); // Adjust your endpoint
      setData(res.data);
    } catch (err) {
      console.error("Failed to load pending certifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Pending Certification Approvals</h1>
      <DataTable
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

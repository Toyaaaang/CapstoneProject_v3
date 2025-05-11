"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { EvaluatedRequest } from "./columns";
import  DataTable  from "@/components/Tables/DataTable"; // Adjust to your table path

export default function EvaluationHistoryPage() {
  const [data, setData] = useState<EvaluatedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/requests/evaluated/") // Adjust to your actual endpoint
      .then((res) => {
        const filtered = (res.data as EvaluatedRequest[]).filter((r: EvaluatedRequest) =>
          ["charged", "requisitioned", "partially_fulfilled", "rejected", "invalid"].includes(r.status)
        );
        setData(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load evaluation history", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title='Evaluated Material Requests' columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

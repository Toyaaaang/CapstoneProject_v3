"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import DataTable from "@/components/Tables/DataTable"; // Your reusable table component
import TableLoader from "@/components/Loaders/TableLoader"; // Assuming you have a loader component
import { ReturnRecord } from "./columns";

export default function ReturnHistoryPage() {
  const [data, setData] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/returns/history/") // Adjust based on your backend endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load return history", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      {loading ? (
        <TableLoader />
      ) : (
        <DataTable title="Return History" columns={columns} data={data} />
      )}
    </div>
  );
}

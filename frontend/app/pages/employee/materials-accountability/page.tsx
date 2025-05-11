"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { AccountabilityRecord } from "./columns";
import DataTable from "@/components/Tables/DataTable"; // Adjust to your table path
import TableLoader from "@/components/Loaders/TableLoader"; // Assuming you have a loader component

export default function AccountabilityPage() {
  const [data, setData] = useState<AccountabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/accountability/employee/") // Replace with your actual endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load accountability data", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      {loading ? (
        <TableLoader />
      ) : (
        <DataTable title="My Accountabilities" columns={columns} data={data} />
      )}
    </div>
  );
}

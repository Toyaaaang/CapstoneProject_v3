"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { CreditReturn } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function CreditReturnsPage() {
  const [data, setData] = useState<CreditReturn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse/credit-returns/pending/");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load credit returns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable
        title="Pending Credit Tickets"
        columns={columns({ refreshData: fetchData })}
        data={data}
        isLoading={loading}
      />
    </div>
  );
}

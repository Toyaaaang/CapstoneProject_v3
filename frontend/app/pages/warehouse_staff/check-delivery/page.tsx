"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { DeliveryPO } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function ValidateDeliveryPage() {
  const [data, setData] = useState<DeliveryPO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/warehouse/pending-pos/");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load POs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Validate Pending Deliveries" columns={columns({ refreshData: fetchData })} data={data} isLoading={loading} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { columns } from "./columns";
import { ValidatedDelivery } from "./columns";
import DataTable from "@/components/Tables/DataTable";

export default function DeliveryValidationHistoryPage() {
  const [data, setData] = useState<ValidatedDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/warehouse/validated-deliveries/") // adjust your endpoint
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load delivery history", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <DataTable title="Delivery Validation History" columns={columns} data={data} isLoading={loading} />
    </div>
  );
}

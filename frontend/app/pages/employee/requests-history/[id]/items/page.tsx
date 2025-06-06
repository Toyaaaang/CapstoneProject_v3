"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MaterialsTable from "@/components/Tables/MaterialsTable";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";

export default function RequestItemsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/requests/employee/requests-history/${id}/`)
      .then(res => {
        setItems(
          res.data.items.map((item: any) => ({
            name: item.material?.name || item.custom_name || "Unknown",
            category: item.material?.category || "—",
            quantity: item.quantity,
            unit: item.unit,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="p-6">
      <MaterialsTable
        data={items}
        columns={[
          { header: "Name", accessorKey: "name" },
          { header: "Quantity", accessorKey: "quantity" },
          { header: "Unit", accessorKey: "unit" },
          { header: "Category", accessorKey: "category" },
        ]}
        loading={loading}
      />
      <Button variant="outline" className="m-4" onClick={() => router.back()}>
        ← Back
      </Button>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MaterialsTable from "@/components/Tables/MaterialsTable";
import { ColumnDef } from "@tanstack/react-table";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";

const columns: ColumnDef<any>[] = [
  {
    header: "Material",
    accessorFn: (row) =>
      row.material_details?.name || row.material_name || row.custom_name || "Custom Item",
  },
  {
    header: "Quantity",
    accessorKey: "delivered_quantity",
    cell: ({ row }) => parseInt(row.original.delivered_quantity, 10),
  },
  {
    header: "Unit",
    accessorFn: (row) => row.material_details?.unit || row.custom_unit || "-",
  },
  {
    header: "Type",
    accessorFn: (row) => (row.material_details ? "Catalog" : "Custom"),
  },
  {
    header: "Remarks",
    accessorKey: "remarks",
    cell: ({ row }) => row.original.remarks || "-",
  },
  {
    header: "Delivery Date",
    accessorKey: "delivery_date",
    cell: ({ row }) =>
      row.original.delivery_date
        ? new Date(row.original.delivery_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-",
  },
];

export default function POItemsPage() {
  const { id } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/requests/purchase-orders/${id}`);
        const deliveries = res.data.deliveries ?? [];

        const processed = deliveries.map((delivery: any) => ({
          ...delivery,
          material_details: delivery.material_details || {},
        }));

        setItems(processed);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="p-4">
      <MaterialsTable
        data={items}
        columns={columns}
        loading={loading}
        title={`Deliveries for PO-${id}`}
      />
      <Button
        variant="outline"
        className="mt-6"
        onClick={() => router.back()}
      >
        Back
      </Button>
    </div>
  );
}

"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import MaterialsTable from "@/components/Tables/MaterialsTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const itemColumns = [
  {
    header: "Material",
    accessorKey: "material_name",
    cell: ({ row }) => (
      row.original.material_name || (
        <span className="italic text-muted-foreground">Unnamed Item</span>
      )
    ),
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
    cell: ({ row }) => row.original.quantity ?? "-",
  },
  {
    header: "Unit",
    accessorKey: "unit",
    cell: ({ row }) => row.original.unit ?? "-",
  },
  {
    header: "Inspection Type",
    accessorKey: "inspection_type",
    cell: ({ row }) => row.original.inspection_type || "-",
  },
  {
    header: "Remarks",
    accessorKey: "remarks",
    cell: ({ row }) => row.original.remarks || "-",
  },
];

export default function CertificationItemsPage() {
  const { id } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`/requests/certifications/${id}`).then((res) => {
      setItems(res.data.items || []);
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="p-4">
      <MaterialsTable
        data={items}
        columns={itemColumns}
        loading={loading}
      />
      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    </div>
  );
}
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DataTable from "@/components/Tables/DataTable";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import TableLoader from "@/components/Loaders/TableLoader";
import ValidateDeliveryDialog from "@/components/dialogs/DeliveryDialog";

export default function DeliveryItemsPage() {
  const { id } = useParams();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  useEffect(() => {
    axios.get(`/requests/purchase-orders/${id}/`).then(res => {
      setDelivery(res.data);
      setLoading(false);
    });
  }, [id]);


  if (loading) return <TableLoader />;
  if (!delivery) return <div className="p-8">Not found.</div>;

  // Paginate items
  const paginatedItems = delivery.items.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      header: "Material",
      accessorKey: "material.name",
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: ({ row }: any) => Number(row.original.quantity).toFixed(0),
    },
    {
      header: "Unit",
      accessorKey: "unit",
    },
  ];

  return (
    <div className="w-full mx-auto p-6">
      <DataTable
        title={`Items to be Delivered for ${delivery.po_number}`}
        columns={columns}
        data={paginatedItems}
        page={page}
        setPage={setPage}
        totalCount={delivery.items.length}
        pageSize={pageSize}
      />
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft />
          Back
        </Button>
        <ValidateDeliveryDialog
          po={delivery}
          refreshData={() => {
            // Optionally reload the delivery after validation
            setLoading(true);
            axios.get(`/requests/deliveries/${id}/`).then(res => {
              setDelivery(res.data);
              setLoading(false);
            });
          }}
        />
      </div>
    </div>
  );
}
"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MaterialsTable from "@/components/Tables/MaterialsTable";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

export default function RequestItemsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10; // or any number you want

  useEffect(() => {
    axios.get(`/requests/employee/requests-history/${id}/`)
      .then(res => {
        setItems(
          res.data.items.map((item: any) => ({
            name: item.material?.name || item.custom_name || "Unknown",
            category: item.material?.category
              ? item.material.category.charAt(0).toUpperCase() + item.material.category.slice(1)
              : "—",
            quantity: Math.round(item.quantity),
            unit: item.unit,
          }))
        );
        setStatus(res.data.status);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Slice items for current page
  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6">
      <MaterialsTable
        data={pagedItems}
        columns={[
          { header: "Name", accessorKey: "name" },
          { header: "Quantity", accessorKey: "quantity" },
          { header: "Unit", accessorKey: "unit" },
          { header: "Category", accessorKey: "category" },
        ]}
        loading={loading}
        page={page}
        setPage={setPage}
        totalCount={items.length}
        pageSize={pageSize}
      />
      <Button variant="outline" className="m-4" onClick={() => router.back()}>
        ← Back
      </Button>
      {status === "ready_for_release" && (
        <Button
          variant="outline"
          className="mt-2 mb-4"
          onClick={() => window.open(`/pages/employee/requests-history/${id}/printable`, "_blank")}
        >
          <Download className="mr-2" />
          Download/Print Charge Form
        </Button>
      )}
    </div>
  );
}
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
  const pageSize = 10;

  type MaterialRequestItem = {
    material?: { name?: string; category?: string };
    custom_name?: string;
    quantity: number;
    unit: string;
  };
  type MaterialRequestData = {
    items: MaterialRequestItem[];
    status: string;
    work_order_no?: string;
    actual_completion?: string;
    duration?: string;
    manpower?: string;
    target_completion?: string;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/requests/employee/requests-history/${id}/`);
      const data = res.data as MaterialRequestData;
      setItems(
        data.items.map((item: any) => ({
          name: item.material?.name || item.custom_name || "Unknown",
          category: item.material?.category
            ? item.material.category.charAt(0).toUpperCase() + item.material.category.slice(1)
            : "—",
          quantity: Math.round(item.quantity),
          unit: item.unit,
        }))
      );
      setStatus(data.status);
      setWorkOrderNo(data.work_order_no || "");
      setActualCompletion(data.actual_completion?.slice(0, 10) || "");
      setDuration(data.duration || "");
      setManpower(data.manpower || "");
      setTargetCompletion(data.target_completion?.slice(0, 10) || "");
    } catch (error) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      <div className="flex gap-2 m-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
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
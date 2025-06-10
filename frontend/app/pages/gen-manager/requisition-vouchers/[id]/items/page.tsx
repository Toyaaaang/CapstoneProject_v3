"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MaterialsTable from "@/components/Tables/MaterialsTable";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { RejectRVDialog } from "@/components/dialogs/RejectRVDialog";

export default function GMRequisitionVoucherItemsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [estimates, setEstimates] = useState<{ [material_id: number]: any }>({});
  const [vatRate, setVatRate] = useState<number>(0);

  useEffect(() => {
    type Item = {
      material?: { name?: string; category?: string };
      material_name?: string;
      custom_name?: string;
      category?: string;
      quantity: number;
      unit: string;
    };
    type VoucherData = {
      items: Item[];
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/requests/requisition-vouchers/${id}/`);
        const data = res.data as VoucherData;
        setItems(
          data.items.map((item: any) => ({
            material_id: item.material?.id ?? null,
            name: item.material?.name || item.material_name || item.custom_name || "Unknown",
            category: item.material?.category
              ? item.material.category.charAt(0).toUpperCase() + item.material.category.slice(1)
              : item.category
              ? item.category.charAt(0).toUpperCase() + item.category.slice(1)
              : "—",
            quantity: Math.round(item.quantity),
            unit: item.unit,
          }))
        );
        setVatRate(parseFloat(data.vat_rate) || 0);
      } catch (error) {
        toast.error("Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (items.length > 0) {
      const materialItems = items
        .filter(item => item.material_id)
        .map(item => ({
          material_id: item.material_id,
          unit: item.unit,
        }));

      if (materialItems.length > 0) {
        axios.post("/requests/purchase-orders/estimate/", { items: materialItems })
          .then(res => setEstimates(res.data));
      }
    }
  }, [items]);

  // Slice items for current page
  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  // Action handlers
  const handleApprove = async () => {
    try {
      await axios.patch(`/requests/requisition-vouchers/${id}/approve/`);
      toast.success("RV approved.");
      router.back();
    } catch (err) {
      toast.error("Approval failed.");
    }
  };

  return (
    <div className="p-6">
      <MaterialsTable
        data={pagedItems}
        columns={[
          { header: "Name", accessorKey: "name" },
          { header: "Quantity", accessorKey: "quantity" },
          { header: "Unit", accessorKey: "unit" },
          {
            id: "estimatedAmount",
            header: (
              <>
                Estimated Amount
                <br />
                <span className="text-sm text-gray-800 dark:text-gray-400 font-medium">
                  (Historical + VAT)
                </span>
              </>
            ) as any,
            cell: ({ row }) => {
              const estimate = estimates[row.original.material_id];
              const estimateWithVat =
                estimate
                  ? estimate.average * row.original.quantity * (1 + vatRate / 100)
                  : null;
              return estimateWithVat !== null
                ? `₱${estimateWithVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : <span className="italic text-muted-foreground">No estimate</span>;
            }
          }
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
        <ConfirmActionDialog
          trigger={
            <Button size="sm">
              Approve
            </Button>
          }
          title="Approve Requisition Voucher?"
          description="Do you want to continue with this action? This cannot be undone."
          confirmLabel="Approve"
          cancelLabel="Cancel"
          onConfirm={handleApprove}
        />
        <RejectRVDialog
          rvId={id ? Number(id) : 0}
          refreshData={() => router.back()}
        />
      </div>
    </div>
  );
}
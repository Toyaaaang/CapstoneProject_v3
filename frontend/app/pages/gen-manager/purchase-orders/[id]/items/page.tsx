"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MaterialsTable from "@/components/Tables/MaterialsTable";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Download, FileBarChart2 } from "lucide-react";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { RejectPODialog } from "@/components/dialogs/RejectPODialog";
import { toast } from "sonner";

interface Item {
  material_id: number | null;
  name: string;
  quantity: number;
  unit: string;
  actual: number;
}

interface Estimate {
  average: number;
}

export default function PurchaseOrderItemsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState<Record<number, Estimate>>({});
  const [vatRate, setVatRate] = useState<number>(0); // <-- Add VAT state
  const pageSize = 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/requests/purchase-orders/${id}/`)
      .then(async (res) => {
        const vat = parseFloat(res.data.vat_rate) || 0;
        const mapped: Item[] = (res.data.items || []).map((item: any) => ({
          material_id: item.material?.id ?? null,
          name: item.material?.name || item.custom_name || "Unknown",
          quantity: Math.round(item.quantity),
          unit: item.unit,
          actual: item.unit_price
            ? Number(item.unit_price) * Math.round(item.quantity) * (1 + vat / 100)
            : 0,
        }));
        setItems(mapped);
        setVatRate(vat); // <-- Set VAT rate

        // Fetch estimates for all items
        const estimateRes = await axios.post("/requests/purchase-orders/estimate/", {
          items: mapped
            .filter((i) => i.material_id)
            .map((i) => ({ material_id: i.material_id, unit: i.unit })),
        });
        setEstimates(estimateRes.data);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await axios.patch(`/requests/purchase-orders/${id}/approve/`);
      toast.success("PO approved.");
      router.back();
    } catch {
      toast.error("Failed to approve PO.");
    } finally {
      setLoading(false);
    }
  };

  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6">
      <MaterialsTable
        data={pagedItems}
        columns={[
          { header: "Material Name", accessorKey: "name" },
          { header: "Quantity", accessorKey: "quantity" },
          { header: "Unit", accessorKey: "unit" },
          {
            id: "estimate",
            header: (
              <>
                Estimate
                <br />
                <span className="text-xs text-gray-800 dark:text-gray-400">(Historical Avg + VAT)</span>
              </>
            ),
            cell: ({ row }: { row: { original: Item } }) => {
              const est = row.original.material_id ? estimates[row.original.material_id] : undefined;
              const estimateWithVat =
                est
                  ? est.average * row.original.quantity * (1 + vatRate / 100)
                  : null;
              return estimateWithVat !== null
                ? <span className="font-mono text-blue-700 dark:text-blue-400">₱{estimateWithVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                : <span className="italic text-gray-800 dark:text-gray-400">No estimate</span>;
            }
          },
          {
            id: "actual",
            header: "Actual Cost",
            cell: ({ row }: { row: { original: Item } }) =>
              row.original.actual
                ? <span className="font-mono font-semibold">₱{row.original.actual.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                : <span className="italic text-gray-800 dark:text-gray-400">N/A</span>
          },
          {
            id: "variance",
            header: (
              <>
                Variance
                <br />
                <span className="text-xs text-gray-800 dark:text-gray-400">(Actual - Estimate)</span>
              </>
            ),
            cell: ({ row }: { row: { original: Item } }) => {
              const est = row.original.material_id ? estimates[row.original.material_id] : undefined;
              const actual = row.original.actual;
              const estimateWithVat =
                est
                  ? est.average * row.original.quantity * (1 + vatRate / 100)
                  : null;
              if (estimateWithVat !== null) {
                const variance = actual - estimateWithVat;
                return (
                  <span className={variance > 0 ? "text-red-600 font-mono" : "text-green-600 font-mono"}>
                    ₱{variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                );
              }
              return <span className="italic text-gray-800 dark:text-gray-400">N/A</span>;
            }
          }
        ]}
        loading={loading}
        page={page}
        setPage={setPage}
        totalCount={items.length}
        pageSize={pageSize}
      />
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/pages/gen-manager/purchase-orders/${id}/printable`)}
        >
          <Download />
          Download/Print PO Form
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/pages/gen-manager/purchase-orders/${id}/variance-report`)}
        >
          <FileBarChart2 />
          Variance Report
        </Button>
        <ConfirmActionDialog
          trigger={
            <Button disabled={loading}>
              Approve
            </Button>
          }
          title="Approve Purchase Order?"
          description="Do you want to continue with this action? This cannot be undone."
          confirmLabel="Approve"
          cancelLabel="Cancel"
          onConfirm={handleApprove}
          loading={loading}
        />
        <RejectPODialog
          poId={id as string}
          refreshData={() => {
            router.back();
          }}
        />
      </div>
    </div>
  );
}
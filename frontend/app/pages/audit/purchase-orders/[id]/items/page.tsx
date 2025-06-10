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

export default function PurchaseOrderItemsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState<{ [material_id: number]: any }>({});
  const pageSize = 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Try the correct endpoint for audit PO items:
    axios.get(`/requests/purchase-orders/${id}/`)
      .then(async res => {
        // Adjust mapping based on your actual response structure
        const mapped = (res.data.items || []).map((item: any) => ({
          material_id: item.material?.id ?? null,
          name: item.material?.name || item.custom_name || "Unknown",
          quantity: Math.round(item.quantity),
          unit: item.unit,
          actual: item.unit_price ? Number(item.unit_price) : 0,
        }));
        setItems(mapped);

        // Fetch estimates for all items
        const estimateRes = await axios.post("/requests/purchase-orders/estimate/", {
          items: mapped
            .filter(i => i.material_id)
            .map(i => ({ material_id: i.material_id, unit: i.unit })),
        });
        setEstimates(estimateRes.data);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRecommend = async () => {
    setLoading(true);
    try {
      await axios.patch(`/requests/purchase-orders/${id}/recommend/`);
      toast.success("PO recommended.");
      router.back(); // Push back after recommend
    } catch {
      toast.error("Failed to recommend PO.");
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
                <span className="text-xs text-gray-800 dark:text-gray-400">(Historical Avg)</span>
              </>
            ),
            cell: ({ row }) => {
              const est = estimates[row.original.material_id];
              return est
                ? `₱${est.average.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : <span className="italic text-gray-800 dark:text-gray-400">No estimate</span>;
            }
          },
          {
            id: "actual",
            header: "Actual",
            cell: ({ row }) =>
              row.original.actual
                ? `₱${row.original.actual.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
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
            cell: ({ row }) => {
              const est = estimates[row.original.material_id];
              const actual = row.original.actual;
              if (est && est.average) {
                const variance = actual - est.average;
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
          onClick={() => router.push(`/pages/audit/purchase-orders/${id}/printable`)}
        >
          <Download />
          Download/Print PO Form
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/pages/audit/purchase-orders/${id}/variance-report`)}
        >
          <FileBarChart2 />
          Variance Report
        </Button>
        <ConfirmActionDialog
          trigger={
            <Button disabled={loading}>
              Recommend
            </Button>
          }
          title="Recommend Purchase Order?"
          description="Do you want to continue with this action? This cannot be undone."
          confirmLabel="Recommend"
          cancelLabel="Cancel"
          onConfirm={handleRecommend}
          loading={loading}
        />
        <RejectPODialog
          poId={id}
          refreshData={() => {
            router.back(); // Push back after reject
          }}
        />
      </div>
    </div>
  );
}
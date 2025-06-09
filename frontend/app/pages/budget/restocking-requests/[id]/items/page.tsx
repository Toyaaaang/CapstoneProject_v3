"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MaterialsTable from "@/components/Tables/MaterialsTable";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { RejectRVDialog } from "@/components/dialogs/RejectRVDialog";
import { toast } from "sonner";

export default function RestockingRequestItemsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [rvNumber, setRvNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [location, setLocation] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [estimates, setEstimates] = useState<{ [material_id: number]: any }>({});

  useEffect(() => {
    type RestockingItem = {
      material?: { name?: string; category?: string };
      custom_name?: string;
      quantity: number;
      unit: string;
    };
    type RestockingRequestData = {
      items: RestockingItem[];
      status: string;
      rv_number?: string;
      purpose?: string;
      location?: string;
      created_at?: string;
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/requests/requisition-vouchers/${id}/`);
        const data = res.data as RestockingRequestData;
        setItems(
          data.items.map((item: any) => ({
            material_id: item.material?.id ?? null,
            name: item.material?.name || item.custom_name || "Unknown",
            category: item.material?.category
              ? item.material.category.charAt(0).toUpperCase() + item.material.category.slice(1)
              : "—",
            quantity: Math.round(item.quantity),
            unit: item.unit,
          }))
        );
        setStatus(data.status);
        setRvNumber(data.rv_number || "");
        setPurpose(data.purpose || "");
        setLocation(data.location || "");
        setCreatedAt(data.created_at ? new Date(data.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) : "");
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
          .then(res => setEstimates(res.data as { [material_id: number]: any }));
      }
    }
  }, [items]);

  // Slice items for current page
  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  // Action handlers
  const handleRecommend = async () => {
    try {
      await axios.patch(`/requests/requisition-vouchers/${id}/recommend/`);
      toast.success("RV recommended.");
      router.back(); // Go back after recommending
    } catch (err) {
      toast.error("Recommendation failed.");
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
                  (Based on Historical Purchases)
                </span>
              </>
            ) as any,
            cell: ({ row }) => {
              const estimate = estimates[row.original.material_id];
              return estimate
                ? `₱${(estimate.average * row.original.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
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
              Recommend
            </Button>
          }
          title="Recommend Restocking RV?"
          description="Do you want to continue with this action? This cannot be undone."
          confirmLabel="Recommend"
          cancelLabel="Cancel"
          onConfirm={handleRecommend}
        />
        <RejectRVDialog
          rvId={typeof id === "string" ? parseInt(id, 10) : Number(id)}
          refreshData={() => router.back()}
        />
      </div>
    </div>
  );
}
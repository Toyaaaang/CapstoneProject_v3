"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import DrawerTable from "@/components/dialogs/DrawerTable";

const QC_REMARKS = [
  "Satisfactory",
  "Damaged Packaging",
  "Incorrect Item",
  "No Issues Found",
  "Pending Further Inspection",
];

export default function QualityCheckDrawer({
  po,
  refreshData,
}: {
  po: any;
  refreshData: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(
    po.items.map((item: any) => ({
      po_item_id: item.id,
      requires_certification: false,
      remarks: "Satisfactory",
      material_name: item.material?.name || item.custom_name || "Custom Item",
      quantity: item.quantity,
      unit: item.unit,
    }))
  );

  const handleCheckboxChange = (index: number, value: boolean) => {
    const updated = [...items];
    updated[index].requires_certification = value;
    setItems(updated);
  };

  const handleRemarksChange = (index: number, value: string) => {
    const updated = [...items];
    updated[index].remarks = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/requests/quality-checks/", {
        purchase_order_id: po.id,
        items: items.map((i) => ({
          po_item_id: i.po_item_id,
          requires_certification: i.requires_certification,
          remarks: i.remarks,
        })),
      });
      toast.success("Quality Check submitted");
      refreshData();
    } catch (err) {
      toast.error("Failed to submit QC");
    } finally {
      setLoading(false);
    }
  };

  // Table columns with interactive cells
  const columns = [
    { header: "Material", accessorKey: "material_name" },
    { header: "Quantity", accessorKey: "quantity" },
    { header: "Unit", accessorKey: "unit" },
    {
      header: "Requires Cert.",
      accessorKey: "requires_certification",
      cell: ({ row }: any) => (
        <Checkbox
          checked={items[row.index].requires_certification}
          onCheckedChange={(checked) => handleCheckboxChange(row.index, !!checked)}
          id={`cert-${row.index}`}
        />
      ),
    },
    {
      header: "Remarks",
      accessorKey: "remarks",
      cell: ({ row }: any) => (
        <Select
          value={items[row.index].remarks}
          onValueChange={(value) => handleRemarksChange(row.index, value)}
        >
          <SelectTrigger className="w-full min-w-[120px]">
            <SelectValue placeholder="Select a remark" />
          </SelectTrigger>
          <SelectContent>
            {QC_REMARKS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  // Data for the table (no need to map, just use items)
  const data = items;

  return (
    <DrawerTable
      triggerLabel="Submit QC"
      title={`Quality Check for ${po.po_number}`}
      columns={columns}
      data={data}
    >
      <ConfirmActionDialog
        trigger={
          <Button disabled={loading} className="w-full mt-4">
            {loading ? "Submitting..." : "Submit QC"}
          </Button>
        }
        title="Submit Quality Check?"
        description="Do you want to continue with this action? This cannot be undone."
        confirmLabel="Submit"
        cancelLabel="Cancel"
        onConfirm={handleSubmit}
        loading={loading}
      />
    </DrawerTable>
  );
}

"use client";

import { useState, useMemo, useCallback } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import DataTable from "@/components/Tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PackageCheck, TruckElectric } from 'lucide-react';

type ValidateDeliveryDialogProps = {
  po: any;
  refreshData: () => void;
};

export default function ValidateDeliveryDialog({ po, refreshData }: ValidateDeliveryDialogProps) {
  const [open, setOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Only initialize items once, when po changes
  const [items, setItems] = useState(() =>
    po.items.map((item: any) => ({
      material_id: item.material?.id ?? null,
      custom_name: item.material?.id ? undefined : item.custom_name || item.name,
      name: item.material?.name || item.custom_name || "Custom Item",
      quantity: item.quantity,
      unit: item.unit || "pcs",
      delivered_quantity: item.quantity,
      delivery_status: "complete",
      remarks: "Good",
    }))
  );

  // Paginate items for the current page
  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  // Memoize updateItem
  const updateItem = useCallback((index: number, field: string, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  }, []);

  // Memoize columns
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      header: "Material",
      accessorKey: "name",
      cell: ({ row }) => row.original.name,
    },
    {
      header: "Ordered",
      accessorKey: "quantity",
      cell: ({ row }) => parseInt(row.original.quantity, 10),
    },
    {
      header: "Unit",
      accessorKey: "unit",
      cell: ({ row, table }) =>
        row.original.material_id ? (
          row.original.unit
        ) : (
          <Input
            type="text"
            className="w-16"
            value={row.original.unit}
            onChange={(e) => {
              updateItem(row.index, "unit", e.target.value);
              table.options.meta?.updateData?.(row.index, "unit", e.target.value);
            }}
          />
        ),
    },
    {
      header: "Delivered",
      accessorKey: "delivered_quantity",
      cell: ({ row, table }) => (
        <Input
          type="number"
          min={0}
          step="1"
          className="w-20"
          value={parseInt(row.original.delivered_quantity, 10)}
          onChange={(e) => {
            updateItem(row.index, "delivered_quantity", Math.max(0, parseInt(e.target.value, 10) || 0));
            table.options.meta?.updateData?.(row.index, "delivered_quantity", e.target.value);
          }}
        />
      ),
    },
    {
      header: "Remarks",
      accessorKey: "remarks",
      cell: ({ row, table }) => (
        <Select
          value={row.original.remarks}
          onValueChange={(value) => {
            updateItem(row.index, "remarks", value);
            table.options.meta?.updateData?.(row.index, "remarks", value);
          }}
        >
          <SelectTrigger className="w-32 h-8 px-2 py-1 text-xs" aria-label="Remarks">
            <SelectValue placeholder="Select remarks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Damaged">Damaged</SelectItem>
            <SelectItem value="Missing">Missing</SelectItem>
            <SelectItem value="Wrong Item">Wrong Item</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ], [updateItem]);

  // Memoize tableMeta
  const tableMeta = useMemo(() => ({
    updateData: (rowIndex: number, columnId: string, value: any) => {
      updateItem(rowIndex, columnId, value);
    },
  }), [updateItem]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`/requests/purchase-orders/${po.id}/record-delivery/`, {
        delivery_date: deliveryDate,
        items: items.map((item) => ({
          ...(item.material_id
            ? { material: item.material_id }
            : {
                custom_name: item.custom_name,
                custom_unit: item.unit,
              }),
          delivered_quantity: item.delivered_quantity,
          remarks: item.remarks,
        })),
      });

      toast.success("Delivery recorded.");
      setOpen(false);
      refreshData();
    } catch (err) {
      toast.error("Failed to submit delivery.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const Content = (
    <>
      <div className="p-10">
        <DataTable
          title="Delivery Items"
          columns={columns}
          data={paginatedItems}
          meta={tableMeta}
          page={page}
          setPage={setPage}
          totalCount={items.length}
          pageSize={pageSize}
        />

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="delivery-date" className="pl-1">Delivery Date</Label>
            <Input
              id="delivery-date"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-40"
            />
          </div>
          <ConfirmActionDialog
            trigger={
              <Button disabled={loading}>
                <PackageCheck/>
                {loading ? "Submitting..." : "Submit Delivery"}
              </Button>
            }
            title="Confirm Delivery Count?"
            description="Do you want to continue with this action? This cannot be undone."
            confirmLabel="Submit"
            cancelLabel="Cancel"
            onConfirm={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm"><TruckElectric/>Validate Delivery</Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen w-screen p-0">
        <DrawerHeader>
          <DrawerTitle>Validate Delivery for {po.po_number}</DrawerTitle>
        </DrawerHeader>
        {Content}
        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
}

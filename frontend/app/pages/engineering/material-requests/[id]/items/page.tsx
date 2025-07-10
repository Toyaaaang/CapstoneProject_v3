"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MaterialsTable from "@/components/Tables/MaterialsTable";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Briefcase, Download } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";

export default function RequestItemsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [workOrderNo, setWorkOrderNo] = useState("");
  const [actualCompletion, setActualCompletion] = useState("");
  const [duration, setDuration] = useState("");
  const [manpower, setManpower] = useState("");
  const [targetCompletion, setTargetCompletion] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleAssignWorkOrder = async () => {
    try {
      await axios.patch(
        `/requests/material-requests/${id}/assign-work-order/`,
        {
          work_order_no: workOrderNo,
          actual_completion: actualCompletion || null,
          duration: duration || null,
        }
      );
      setDialogOpen(false);
      // Refetch data to refresh the table
      await fetchData();
      // Go back to previous page
      router.back();
    } catch (err) {
      // Optionally show a toast
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Briefcase/>Assign/Update Work Order</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Work Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>Manpower</Label>
                <Input value={manpower || "None"} readOnly className="opacity-70" />
              </div>
              <div className="space-y-1">
                <Label>Target Date of Completion</Label>
                <Input value={targetCompletion || "None"} readOnly className="opacity-70" />
              </div>
              <div className="space-y-1">
                <Label>Work Order Number</Label>
                <Input
                  placeholder="Work Order Number"
                  value={workOrderNo}
                  onChange={(e) => setWorkOrderNo(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Actual Completion Date</Label>
                <Input
                  type="date"
                  value={actualCompletion}
                  onChange={(e) => setActualCompletion(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Work Duration</Label>
                <Input
                  placeholder="Duration (e.g., 3 days)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <ConfirmActionDialog
                trigger={<Button className="w-full">Save</Button>}
                title="Save Work Order?"
                description="Are you sure you want to save these changes? This action cannot be undone."
                confirmLabel="Save"
                cancelLabel="Cancel"
                onConfirm={handleAssignWorkOrder}
                loading={false}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
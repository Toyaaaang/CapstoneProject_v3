"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useRouter } from "next/navigation";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export type MaterialRequest = {
  location: any;
  id: number;
  purpose: string;
  status: string;
  created_at: string;
  requester: {
    first_name: string;
    last_name: string;
  };
  manpower?: string | null;
  target_completion?: string | null;
  work_order_no?: string;
  actual_completion?: string | null;
  duration?: string | null;
};

// Map status to badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    case "completed":
      return "info";
    case "in_progress":
      return "secondary";
    default:
      return "outline";
  }
};

export const columns = (
  refreshData: () => void
): ColumnDef<MaterialRequest>[] => [
  {
    header: "Requested By",
    cell: ({ row }) =>
      `${row.original.requester.first_name} ${row.original.requester.last_name}`,
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button className="max-w-[180px] truncate">
            {row.original.purpose || "No purpose provided"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-2">
          <div>
            <span className="font-semibold text-sm">Purpose:</span>
            <span className="ml-1 text-sm">{row.original.purpose}</span>
          </div>
          <div>
            <span className="font-semibold text-sm">Location of Work:</span>
            <span className="ml-1 text-sm">
              {row.original.location || (
                <span className="italic text-muted-foreground">No location</span>
              )}
            </span>
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Date",
    accessorKey: "created_at",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)} className="capitalize">
        {row.original.status.replaceAll("_", " ")}
      </Badge>
    ),
  },
  {
    header: "Work Order No.",
    accessorKey: "work_order_no",
    cell: ({ row }) => row.original.work_order_no || "—",
  },
  {
    header: "Items",
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/pages/engineering/material-requests/${row.original.id}/items`)}
        >
          View Items
        </Button>
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const request = row.original;
      const [open, setOpen] = useState(false);
      const [workOrderNo, setWorkOrderNo] = useState(request.work_order_no || "");
      const [actualCompletion, setActualCompletion] = useState(
        request.actual_completion?.slice(0, 10) || ""
      );
      const [duration, setDuration] = useState(request.duration || "");

      const handleSubmit = async () => {
        try {
          await axios.patch(
            `/requests/material-requests/${request.id}/assign-work-order/`,
            {
              work_order_no: workOrderNo,
              actual_completion: actualCompletion || null,
              duration: duration || null,
            }
          );
          toast.success("Work order updated.");
          refreshData();
          setOpen(false);
        } catch (err) {
          toast.error("Failed to assign work order.");
          console.error(err);
        }
      };

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              Assign/Update
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Work Order</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {/* Display-only Fields */}
              <div className="space-y-1">
                <Label htmlFor={`manpower-${request.id}`}>Manpower</Label>
                <Input
                  id={`manpower-${request.id}`}
                  value={request.manpower || "None"}
                  readOnly
                  className="opacity-70"
                  placeholder="Manpower"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`target-completion-${request.id}`}>
                  Target Date of Completion
                </Label>
                <Input
                  id={`target-completion-${request.id}`}
                  value={request.target_completion?.slice(0, 10) || "None"}
                  readOnly
                  className="opacity-70"
                  placeholder="Target Completion"
                />
              </div>

              {/* Editable Fields */}
              <div className="space-y-1">
                <Label htmlFor={`work-order-no-${request.id}`}>Work Order Number</Label>
                <Input
                  id={`work-order-no-${request.id}`}
                  placeholder="Work Order Number"
                  value={workOrderNo}
                  onChange={(e) => setWorkOrderNo(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`actual-completion-${request.id}`}>Actual Completion Date</Label>
                <Input
                  id={`actual-completion-${request.id}`}
                  type="date"
                  value={actualCompletion}
                  onChange={(e) => setActualCompletion(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`duration-${request.id}`}>Work Duration</Label>
                <Input
                  id={`duration-${request.id}`}
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
                onConfirm={handleSubmit}
                loading={false}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  },
];

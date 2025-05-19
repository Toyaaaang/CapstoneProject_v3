// app/(dashboard)/certifications/gm/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CertificationRecord } from "@/hooks/certifications/useCertificationsForGM";

export const columns: ColumnDef<CertificationRecord>[] = [
  {
    header: "PO Number",
    accessorKey: "purchase_order.po_number",
  },
  {
    header: "Delivery Date",
    accessorKey: "delivery_record.delivery_date",
  },
  {
    header: "Created At",
    accessorKey: "created_at",
  },
  {
    header: "Actions",
    cell: ({ row, table }) => {
      const cert = row.original;
      const [open, setOpen] = useState(false);
      const [reason, setReason] = useState("");

      const handleApprove = async () => {
        try {
          await axios.post(`/requests/certifications/${cert.id}/approve/`);
          toast.success("Certification approved.");
          table.options.meta?.refreshData?.();
        } catch {
          toast.error("Approval failed.");
        }
      };

      const handleReject = async () => {
        try {
          await axios.post(`/requests/certifications/${cert.id}/reject/`, { reason });
          toast.success("Certification rejected.");
          setOpen(false);
          table.options.meta?.refreshData?.();
        } catch {
          toast.error("Rejection failed.");
        }
      };

      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApprove}>
            Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setOpen(true)}>
            Reject
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Rejection Reason</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Incomplete documents">Incomplete documents</SelectItem>
                    <SelectItem value="Incorrect delivery">Incorrect delivery</SelectItem>
                    <SelectItem value="Quality mismatch">Quality mismatch</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled={!reason} onClick={handleReject}>
                  Submit Rejection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];

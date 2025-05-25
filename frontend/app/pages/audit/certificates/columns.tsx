// app/(dashboard)/certifications/audit/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { CertificationRecord } from "@/hooks/audit/useCertificationsForAudit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


export const columns: ColumnDef<CertificationRecord>[] = [
  {
    header: "PO Number",
    accessorFn: (row) => row.purchase_order.po_number,
    cell: ({ row }) => (
      <span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded">
        {row.original.purchase_order.po_number}
      </span>
    ),
  },
  {
    header: "Delivery Date",
    accessorFn: (row) => row.delivery_record.delivery_date,
    cell: ({ row }) =>
      row.original.delivery_record?.delivery_date
        ? new Date(row.original.delivery_record.delivery_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : <span className="italic text-muted-foreground">N/A</span>,
  },
  {
    header: "Status",
    accessorFn: (row) => {
      if (row.rejection_reason) return "Rejected";
      if (row.is_finalized) return "Finalized";
      return "Pending";
    },
    cell: ({ row }) => {
      let status = "Pending";
      let variant: "default" | "secondary" | "destructive" = "secondary";
      if (row.original.rejection_reason) {
        status = "Rejected";
        variant = "destructive";
      } else if (row.original.is_finalized) {
        status = "Finalized";
        variant = "default";
      }
      return (
        <Badge variant={variant} className="uppercase tracking-wide">
          {status}
        </Badge>
      );
    },
  },
  
  {
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              View Items
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-72 overflow-auto">
            {items.length > 0 ? (
              <div>
                <div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
                  <span>Material</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Unit</span>
                </div>
                <div className="space-y-2">
                  {items.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                    >
                      <div className="font-medium truncate">
                        {item.material_name}
                      </div>
                      <div className="text-center text-muted-foreground">
                        {item.quantity}
                      </div>
                      <div className="text-right text-muted-foreground">
                        {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-xs">No items</div>
            )}
          </PopoverContent>
        </Popover>
      );
    },
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
        } catch (err) {
          toast.error("Approval failed.");
        }
      };

      const handleReject = async () => {
        try {
          await axios.post(`/requests/certifications/${cert.id}/reject/`, { reason });
          toast.success("Certification rejected.");
          setOpen(false);
          table.options.meta?.refreshData?.();
        } catch (err) {
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

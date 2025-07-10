import { ColumnDef } from "@tanstack/react-table";
import axios from "@/lib/axios";
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ReceivingReport } from "@/hooks/admin/useUnapprovedReceivingReports";
import ReportPreviewDialog from "@/components/dialogs/ReportPreviewDialog";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";

export const columns: ColumnDef<ReceivingReport>[] = [
  {
    header: "PO Number",
    accessorKey: "po_number",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.po_number || "N/A"}</span>
    ),
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = row.original.created_at
        ? new Date(row.original.created_at).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";
      return <span className="text-sm">{date}</span>;
    },
  },
  {
    header: "Action",
    cell: ({ row, table }) => {
      const report = row.original;
      const [loading, setLoading] = React.useState(false);

      const approve = async () => {
        setLoading(true);
        try {
          await axios.post(`/requests/receiving-reports/${report.id}/approve/`);
          toast.success("Approved successfully.");
          table.options.meta?.refreshData?.();
        } catch (err) {
          console.error(err);
          toast.error("Approval failed.");
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="flex gap-2">
          <ReportPreviewDialog report={report} />
          <ConfirmActionDialog
            trigger={
              <Button size="sm" disabled={loading}>
                Approve
              </Button>
            }
            title="Approve Receiving Report?"
            description="Do you want to continue? Materials will be added to the Inventory with this action. This cannot be undone."
            confirmLabel="Approve"
            cancelLabel="Cancel"
            onConfirm={approve}
            loading={loading}
          />
        </div>
      );
    },
  },
];

import { ColumnDef } from "@tanstack/react-table";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ReceivingReport } from "@/hooks/admin/useUnapprovedReceivingReports";
import ReportPreviewDialog from "@/components/dialogs/ReportPreviewDialog";

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

      const approve = async () => {
        try {
          await axios.post(`/requests/receiving-reports/${report.id}/approve/`);
          toast.success("Approved successfully.");
          table.options.meta?.refreshData?.();
        } catch (err) {
          console.error(err);
          toast.error("Approval failed.");
        }
      };

      return (
        <div className="flex gap-2">
          <ReportPreviewDialog report={report} />
          <Button size="sm" onClick={approve}>
            Approve
          </Button>
        </div>
      );
    },
  },
];

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
  },
  {
    header: "Created At",
    accessorKey: "created_at",
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
        } catch {
          toast.error("Approval failed.");
        }
      };

      return (
        <div className="flex gap-2">
          <ReportPreviewDialog report={report} />
          <Button size="sm" onClick={approve}>Approve</Button>
        </div>
      );
    },
  }
];

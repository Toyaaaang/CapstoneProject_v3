import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";

export type ReceivingReportRecord = {
    id: number;
    rr_no: string;
    po_no: string;
    supplier: string;
    department: string;
    created_by: string;
    created_at: string;
    items: {
      material_name: string;
      unit: string;
      quantity: number;
    }[];
  };
  

export const columns: ColumnDef<ReceivingReportRecord>[] = [
  {
    header: "RR No.",
    accessorKey: "rr_no",
    cell: ({ row }) => <span className="font-mono">{row.original.rr_no}</span>,
  },
  {
    header: "PO No.",
    accessorKey: "po_no",
    cell: ({ row }) => <span className="font-mono">{row.original.po_no}</span>,
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Created By",
    accessorKey: "created_by",
  },
  {
    header: "Date",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Items",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">View</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <ul className="text-sm space-y-1 py-2">
            {row.original.items.map((item, i) => (
              <li key={i}>
                {item.material_name} – {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Actions",
    cell: ({ row, table }) => {
      const [loading, setLoading] = React.useState(false);

      const handleAcknowledge = async () => {
        setLoading(true);
        try {
          // Replace with your actual endpoint and logic
          await axios.patch(`/warehouse/receiving-reports/${row.original.id}/acknowledge/`);
          toast.success("Receiving Report acknowledged.");
          table.options.meta?.refreshData?.();
        } catch (err) {
          toast.error("Failed to acknowledge.");
        } finally {
          setLoading(false);
        }
      };

      return (
        <ConfirmActionDialog
          trigger={
            <Button size="sm" disabled={loading}>
              Acknowledge
            </Button>
          }
          title="Acknowledge Receiving Report?"
          description="Do you want to continue with this action? This cannot be undone."
          confirmLabel="Acknowledge"
          cancelLabel="Cancel"
          onConfirm={handleAcknowledge}
          loading={loading}
        />
      );
    },
  },
];

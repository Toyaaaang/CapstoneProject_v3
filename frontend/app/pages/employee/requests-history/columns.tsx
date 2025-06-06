import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation"; // or "next/router" if using older Next.js

export type MaterialRequest = {
  work_order_no: string;
  id: number;
  department: string;
  status: string;
  created_at: string;
  items: {
    custom_name: string;
    material: { name: string };
    quantity: number;
    unit: string;
  }[];
};

// Format: "May 9, 2025 · 10:15 AM"
function formatDateWithTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

// Capitalize first letter and replace underscores
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

// Label mapping from STATUS_CHOICES
function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Pending",
    charged: "Charged",
    requisitioned: "RV Created",
    partially_fulfilled: "Partially Fulfilled",
    invalid: "Invalid",
    rejected: "Rejected",
  };
  return map[status] || capitalize(status);
}

// Badge color variant mapping
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "charged":
    case "requisitioned":
    case "partially_fulfilled":
      return "info";
    case "rejected":
    case "invalid":
      return "destructive";
    default:
      return "secondary";
  }
}

export const columns: ColumnDef<MaterialRequest>[] = [
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => (
      <span className="py-2">{capitalize(row.original.department)}</span>
    ),
  },
  {
    header: "Work Order No.",
    accessorKey: "work_order_no",
    cell: ({ row }) => (
      <span className="py-2">{row.original.work_order_no || "—"}</span>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    header: "Date Created",
    accessorKey: "created_at",
    cell: ({ row }) => (
      <span className="py-2">{formatDateWithTime(row.original.created_at)}</span>
    ),
  },
  {
    header: "Items",
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/pages/employee/requests-history/${row.original.id}/items`)}
        >
          View Items
        </Button>
      );
    },
  },
];

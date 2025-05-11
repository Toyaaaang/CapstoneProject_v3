import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RestockRequest } from "@/hooks/useBudgetRestockApprovals";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export const columns = (
  handleAction: (reference_no: string, action: "approve" | "reject") => void
): ColumnDef<RestockRequest>[] => [
  {
    accessorKey: "reference_no",
    header: "Reference No.",
    cell: ({ row }) => <div className="font-medium">{row.original.reference_no}</div>,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.department?.replace(/_/g, " ") || "—"}</div>
    ),
  },
  {
    accessorKey: "requested_by",
    header: "Requested By",
    cell: ({ row }) => row.original.requested_by,
  },
  {
    accessorKey: "materials",
    header: "Materials",
    cell: ({ row }) => {
      const materials = row.original.materials;

      // Check if materials is defined and has elements
      if (!materials || materials.length === 0) {
        return <span className="text-gray-500">No materials</span>;
      }

      return (
        <Popover>
          <PopoverTrigger asChild>
            <div className="text-sm cursor-pointer hover:bg-gray-100 p-2 rounded">
              {materials.length > 1 ? (
                <div>
                  {materials[0].name} - {materials[0].quantity} {materials[0].unit}{" "}
                  <span className="text-blue-500">...</span>
                </div>
              ) : (
                <div>
                  {materials[0].name} - {materials[0].quantity} {materials[0].unit}
                </div>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              {materials.map((mat, i) => (
                <div key={i}>
                  {mat.name} - {mat.quantity} {mat.unit}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Requested At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleAction(row.original.reference_no, "approve")}>
          Approve
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleAction(row.original.reference_no, "reject")}>
          Reject
        </Button>
      </div>
    ),
  },
];

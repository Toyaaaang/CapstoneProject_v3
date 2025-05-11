import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { GMRequest } from "@/hooks/useGMApprovals";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const columns = (
  handleAction: (reference_no: string, action: "approve" | "reject") => void
): ColumnDef<GMRequest>[] => [
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
  },
  {
    accessorKey: "materials",
    header: "Materials",
    cell: ({ row }) => {
      const materials = row.original.materials;
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
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
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

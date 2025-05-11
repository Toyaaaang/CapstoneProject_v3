import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FinalRestockRequest } from "@/hooks/useFinalApprovedRestocks";
import { usePurchaseOrderForm } from "@/hooks/usePurchaseOrderForm";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const columns = (
  poForm: ReturnType<typeof usePurchaseOrderForm>,
  removeRequestById: (id: number) => void // Accept removeRequestById
): ColumnDef<FinalRestockRequest>[] => [
  {
    accessorKey: "reference_no",
    header: "Reference No.",
    cell: ({ row }) => <div className="font-medium">{row.original.reference_no}</div>,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.department.replace(/_/g, " ")}</div>
    ),
  },
  {
    accessorKey: "requested_by",
    header: "Requested By",
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button
        variant="default"
        onClick={() => {
          const materials = row.original.materials.map((m) => ({
            id: m.material_id,
            name: m.name,
            quantity: m.quantity,
            unit: m.unit,
            unit_price: "",
          }));

          poForm.openDialog(row.original.id, materials, () => {
            // Call removeRequestById after successful PO creation
            removeRequestById(row.original.id);
          });
        }}
      >
        Issue PO
      </Button>
    ),
  },
];

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function getInventoryColumns({ onEdit, editingId, onChange, onSave, onCancel, materials }: any): ColumnDef<any>[] {
  return [
    {
      accessorKey: "name",
      header: "Material",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <select
            value={row.original.material}
            onChange={e => onChange(row.original.id, "material", e.target.value)}
            className="border rounded px-2 py-1"
          >
            {materials.map((mat: any) => (
              <option key={mat.id} value={mat.id}>
                {mat.name}
              </option>
            ))}
          </select>
        ) : (
          row.original.material_name || row.original.material?.name
        ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <Input
            type="number"
            value={row.original.quantity}
            onChange={e => onChange(row.original.id, "quantity", e.target.value)}
          />
        ) : (
          parseFloat(row.original.quantity) % 1 === 0
            ? parseInt(row.original.quantity)
            : row.original.quantity
        ),
    },
    {
      accessorKey: "visible",
      header: "Visible",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <input
            type="checkbox"
            checked={row.original.visible}
            onChange={e => onChange(row.original.id, "visible", e.target.checked)}
          />
        ) : row.original.visible ? "Yes" : "No",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <>
            <Button size="sm" onClick={() => onSave(row.original.id)}>Save</Button>
            <Button size="sm" variant="outline" onClick={onCancel} className="ml-2">Cancel</Button>
          </>
        ) : (
          <Button size="sm" onClick={() => onEdit(row.original.id)}>Edit</Button>
        ),
    },
  ];
}
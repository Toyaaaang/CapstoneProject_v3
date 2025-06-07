"use client";

import React, { useState } from "react";
import DataTable from "@/components/Tables/DataTable";
import { useAdminInventory } from "@/hooks/admin/useAdminInventory";
import { getInventoryColumns } from "./columns";
import TableLoader from "@/components/Loaders/TableLoader";
import AddInventoryDialog from "./AddInventoryDialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminInventoryPage() {
  const {
    inventory,
    materials,
    loading,
    error,
    updateInventory,
    addInventory,
    setInventory,
  } = useAdminInventory();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [localInventory, setLocalInventory] = useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    setLocalInventory(inventory);
  }, [inventory]);

  const handleEdit = (id: number) => setEditingId(id);

  const handleChange = (id: number, field: string, value: any) => {
    setLocalInventory(inv =>
      inv.map(i => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleSave = async (id: number) => {
    const item = localInventory.find(i => i.id === id);
    if (item) {
      await updateInventory(id, {
        material: item.material.id || item.material,
        quantity: item.quantity,
        visible: item.visible,
      });
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setLocalInventory(inventory);
    setEditingId(null);
  };

  const handleAdd = async (item: any) => {
    await addInventory(item);
  };

  const columns = getInventoryColumns({
    onEdit: handleEdit,
    editingId,
    onChange: handleChange,
    onSave: handleSave,
    onCancel: handleCancel,
    materials,
  });

  return (
    <div>
      <div className="flex gap-2 mb-2 ml-5">
        <AddInventoryDialog materials={materials} onAdd={handleAdd} onSuccess={() => fetchInventory()} />
        <Button
          variant="outline"
          onClick={() => router.push("/pages/admin/inventory/batch-add")}
        >
          + Batch Add Inventory
        </Button>
      </div>
      {loading ? (
        <TableLoader />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <DataTable
          title="Inventory"
          columns={columns}
          data={localInventory}
          page={1}
          setPage={() => {}}
          totalCount={localInventory.length}
          pageSize={localInventory.length}
        />
      )}
    </div>
  );
}
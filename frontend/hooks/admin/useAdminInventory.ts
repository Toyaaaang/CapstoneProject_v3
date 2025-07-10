import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export function useAdminInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/inventory/");
      setInventory(res.data.results ?? res.data);
      const mats = await axios.get("/admin/materials/all/");
      setMaterials(mats.data);
    } catch (err: any) {
      setError("Failed to fetch inventory.");
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (id: number, data: any) => {
    try {
      await axios.patch(`/admin/inventory/${id}/`, data);
      await fetchInventory();
    } catch (err: any) {
      console.error("Update error:", err);
      throw err; // Re-throw to handle in the component (e.g. show toast)
    }
  };

  const addInventory = async (data: any) => {
    try {
      await axios.post("/admin/inventory/", data);
      await fetchInventory();
    } catch (err: any) {
      console.error("Add error:", err);
      throw err; // Re-throw so AddInventoryDialog can show a toast
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    materials,
    loading,
    error,
    fetchInventory,
    updateInventory,
    addInventory,
    setInventory,
  };
}

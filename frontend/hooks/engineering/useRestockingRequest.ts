import { useState } from "react";
import axios from "@/lib/axios";

type RestockingItem = {
  item_name: string;
  quantity_requested: number | string;
  unit: string;
};

export default function useRestockingRequest() {
  const [items, setItems] = useState<RestockingItem[]>([
    { item_name: "", quantity_requested: "", unit: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { item_name: "", quantity_requested: "", unit: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index: number, field: keyof RestockingItem, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (reference_no: string, purpose: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await axios.post("/requests/restocking/", {
        reference_no,
        purpose,
        items: items.map(item => ({
          item_name: item.item_name,
          quantity_requested: Number(item.quantity_requested),
          unit: item.unit,
        })),
      });
      setSuccess(true);
      setItems([{ item_name: "", quantity_requested: "", unit: "" }]);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        "Failed to submit restocking request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    handleAddItem,
    handleRemoveItem,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  };
}
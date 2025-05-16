"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import EngOpFields from "./EngOpFields";
import FinanceFields from "./FinanceFields";

type Material = {
  id: number;
  name: string;
  unit: string;
};

type Item = {
  is_custom: boolean;
  material_id?: number;
  custom_name?: string;
  custom_unit?: string;
  quantity: number;
  unit: string;
};

export default function RequestForm() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [department, setDepartment] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  // Common fields
  const [purpose, setPurpose] = useState("");

  // Engineering/Op fields
  const [manpower, setManpower] = useState("");
  const [targetCompletion, setTargetCompletion] = useState("");
  const [actualCompletion, setActualCompletion] = useState("");
  const [duration, setDuration] = useState("");

  // Finance fields
  const [requesterDept, setRequesterDept] = useState("");

  useEffect(() => {
    if (department) {
      axios
        .get(`/inventory-by-department/?department=${department}`)
        .then((res) => setMaterials(res.data.map((inv) => inv.material)));
    }
  }, [department]);

  const addItem = () => {
    setItems([...items, { is_custom: false, quantity: 1, unit: "" }]);
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // Auto-populate units from inventory when material is selected
  useEffect(() => {
    const updatedItems = items.map((item) => {
      if (!item.is_custom && item.material_id) {
        const selected = materials.find((m) => m.id === item.material_id);
        if (selected && item.unit !== selected.unit) {
          return { ...item, unit: selected.unit };
        }
      }
      return item;
    });
    setItems(updatedItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.material_id).join(), materials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formatDate = (val: string) => (val ? val.slice(0, 10) : null);

    const formattedItems = items.map((item) => {
      if (item.is_custom) {
        return {
          custom_name: item.custom_name,
          custom_unit: item.custom_unit,
          quantity: item.quantity,
          unit: item.custom_unit || item.unit,
        };
      } else {
        return {
          material_id: item.material_id,
          quantity: item.quantity,
          unit: item.unit,
        };
      }
    });

    const payload: any = {
      department,
      items: formattedItems,
      purpose,
    };

    if (department === "finance") {
      payload.requester_department = requesterDept;
    } else {
      payload.manpower = manpower;
      payload.target_completion = formatDate(targetCompletion);
      payload.actual_completion = formatDate(actualCompletion);
      payload.duration = duration;
    }

    try {
      await axios.post("requests/material-requests/", payload);
      toast.success("Request submitted successfully!");

      // Reset form
      setDepartment("");
      setItems([]);
      setPurpose("");
      setManpower("");
      setTargetCompletion("");
      setActualCompletion("");
      setDuration("");
      setRequesterDept("");
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.detail ||
        "Failed to submit. Please review the form.";
      toast.error(message);
    }
  };

  return (
    <Card className="p-6 w-full mx-auto space-y-4">
      <h1 className="text-xl font-bold">New Material Request</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Department */}
        <div>
          <Label className="p-2">Department</Label>
          <Select onValueChange={setDepartment} value={department}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="operations_maintenance">
                Operations & Maintenance
              </SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditional Fields */}
        {department === "finance" ? (
          <FinanceFields
            values={{
              requester_department: requesterDept,
              purpose,
            }}
            onChange={(field, value) => {
              if (field === "requester_department") setRequesterDept(value);
              if (field === "purpose") setPurpose(value);
            }}
          />
        ) : department ? (
          <EngOpFields
            values={{
              purpose,
              manpower,
              target_completion: targetCompletion,
              actual_completion: actualCompletion,
              duration,
            }}
            onChange={(field, value) => {
              if (field === "purpose") setPurpose(value);
              if (field === "manpower") setManpower(value);
              if (field === "target_completion") setTargetCompletion(value);
              if (field === "actual_completion") setActualCompletion(value);
              if (field === "duration") setDuration(value);
            }}
          />
        ) : null}

        {/* Items */}
        <div className="space-y-2">
          <Label className="p-2">Items</Label>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 border p-4 rounded bg-muted"
            >
              <div className="flex gap-4 items-center flex-wrap">
                {item.is_custom ? (
                  <>
                    <Input
                      placeholder="Custom material name"
                      value={item.custom_name || ""}
                      onChange={(e) =>
                        updateItem(i, "custom_name", e.target.value)
                      }
                      className="w-64"
                    />
                    <Input
                      placeholder="Custom unit"
                      value={item.custom_unit || ""}
                      onChange={(e) =>
                        updateItem(i, "custom_unit", e.target.value)
                      }
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateItem(i, "is_custom", false)}
                    >
                      Select from inventory
                    </Button>
                  </>
                ) : (
                  <>
                    <Select
                      value={item.material_id?.toString() || ""}
                      onValueChange={(val) => {
                        if (val === "custom") {
                          updateItem(i, "is_custom", true);
                          updateItem(i, "material_id", undefined);
                        } else {
                          updateItem(i, "material_id", Number(val));
                        }
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((mat) => (
                          <SelectItem key={mat.id} value={mat.id.toString()}>
                            {mat.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">
                          ➕ Custom / Not in List
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Unit"
                      value={item.unit}
                      disabled={!item.is_custom}
                      onChange={(e) =>
                        updateItem(i, "unit", e.target.value)
                      }
                      className="w-32"
                    />
                  </>
                )}

                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(i, "quantity", Number(e.target.value))
                  }
                  className="w-24"
                  min={1}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(i)}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem}>
            + Add Item
          </Button>
        </div>

        <Button type="submit" className="w-full">
          Submit Request
        </Button>
      </form>
    </Card>
  );
}

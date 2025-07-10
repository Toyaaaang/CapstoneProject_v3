"use client"

import useRVRestockingForm from "@/hooks/shared/useRVRequestForm"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog"
import axios from "@/lib/axios"
import FormLoader from "@/components/Loaders/FormLoader"

export default function RVRestockingForm() {
  const [department, setDepartment] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const purposeOptions = [
    "Stock Depletion",
    "New Project",
    "Buffer Inventory",
    "Damaged Replacement",
    "Scheduled Maintenance",
    "Other",
  ]

  useEffect(() => {
    axios.get("/authentication/me").then((res) => {
      setDepartment(res.data.department || res.data.role)
      setLoading(false)
    })
  }, [])

  const {
    materials,
    items,
    updateItem,
    addItem,
    removeItem,
    purpose,
    setPurpose,
    handleSubmit,
    isSubmitting,
  } = useRVRestockingForm(department || "")

  if (loading) return <FormLoader />

  return (
    <Card className="w-full p-6 space-y-6" style={{
              // border: "1px solid transparent",
              background: "rgba(0, 17, 252, 0.04)",
              boxShadow: "0 8px 38px 0 rgba(23,23,23,0.17)",
              backdropFilter: "blur(18.5px)",
              WebkitBackdropFilter: "blur(4.5px)",  
            }}>
      <h1 className="text-xl font-bold">Restocking Request</h1>

      <div>
        <Label className="p-2">Purpose</Label>
        <Select value={purpose} onValueChange={setPurpose}>
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            {purposeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="p-2">Items</Label>
        {items.map((item, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 border p-3 rounded">
            {item.is_custom ? (
              <>
                <Input
                  placeholder="Custom name"
                  value={item.custom_name || ""}
                  onChange={(e) => updateItem(i, "custom_name", e.target.value)}
                  className="w-64"
                />
                <Input
                  placeholder="Custom unit"
                  value={item.custom_unit || ""}
                  onChange={(e) => updateItem(i, "custom_unit", e.target.value)}
                  className="w-32"
                />
                <Button type="button" onClick={() => updateItem(i, "is_custom", false)}>
                  Use existing
                </Button>
              </>
            ) : (
              <>
                <Select
                  value={item.material_id !== undefined && item.material_id !== null ? item.material_id.toString() : ""}
                  onValueChange={(val) => {
                    if (val === "custom") {
                      updateItem(i, "is_custom", true)
                      updateItem(i, "material_id", undefined)
                    } else {
                      updateItem(i, "material_id", Number(val))
                    }
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {(materials || []).filter((m): m is { id: number; name: string } => !!m && m.id && m.name).map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">➕ Custom / Not in List</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Unit"
                  value={item.unit}
                  onChange={(e) => updateItem(i, "unit", e.target.value)}
                  className="w-20"
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
              className="w-20"
              min={1}
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() => removeItem(i)}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addItem}>
          + Add Item
        </Button>
      </div>

      <ConfirmActionDialog
        trigger={
          <Button
            type="button"
            className="w-full"
            disabled={isSubmitting || items.length === 0}
          >
            Submit Restocking RV
          </Button>
        }
        title="Submit Restocking Request?"
        description="Do you want to continue with this action? This cannot be undone."
        confirmLabel="Submit"
        cancelLabel="Cancel"
        onConfirm={handleSubmit}
        loading={isSubmitting}
      />
    </Card>
  )
}

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { toast } from "sonner"

export type Material = {
  id: number
  name: string
  unit: string
}

export type Item = {
  is_custom: boolean
  material_id?: number
  custom_name?: string
  custom_unit?: string
  quantity: number
  unit: string
  remarks?: string
}

export default function useRVRestockingForm(department: string) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [purpose, setPurpose] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!department) return

    axios
      .get(`/inventory-by-department/?department=${department}`)
      .then((res) => {
        const fetched = res.data.map((inv: any) => inv.material)
        setMaterials(fetched)
      })
      .catch(() => {
        toast.error("Failed to load department inventory.")
      })
  }, [department])

  useEffect(() => {
    const updated = items.map((item) => {
      if (!item.is_custom && item.material_id) {
        const matched = materials.find((m) => m.id === item.material_id)
        if (matched && item.unit !== matched.unit) {
          return { ...item, unit: matched.unit }
        }
      }
      return item
    })
    setItems(updated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.material_id).join(), materials])

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  const addItem = () =>
    setItems((prev) => [...prev, { is_custom: false, quantity: 1, unit: "" }])

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const formattedItems = items.map((item) =>
      item.is_custom
        ? {
            custom_name: item.custom_name,
            custom_unit: item.custom_unit,
            quantity: item.quantity,
            unit: item.custom_unit || item.unit,
          }
        : {
            material_id: item.material_id,
            quantity: item.quantity,
            unit: item.unit,
          }
    )

    try {
      await axios.post("/requests/requisition-vouchers/", {
        is_restocking: true,
        purpose,
        items: formattedItems,
      })

      toast.success("Restocking request submitted successfully.")
      setPurpose("")
      setItems([])
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || "Submission failed. Please review your input."
      toast.error(detail)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    materials,
    items,
    updateItem,
    addItem,
    removeItem,
    purpose,
    setPurpose,
    handleSubmit,
    isSubmitting,
  }
}

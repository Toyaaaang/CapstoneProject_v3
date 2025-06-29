"use client";

import { useEffect, useState, useRef } from "react";
import axios from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LocationAutocomplete from "@/components/ui/LocationAutocomplete";
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
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { useGooglePlacesReady } from "@/hooks/googleAPI/useGooglePlacesReady";
import FormLoader from "@/components/Loaders/FormLoader";
import { Combobox } from "@/components/ui/combobox"; // <-- use your reusable Combobox

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

type RequestFormProps = {
  children?: React.ReactNode;
};

export default function RequestForm({ children }: RequestFormProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [department, setDepartment] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Common fields
  const [purpose, setPurpose] = useState("");

  // Engineering/Op fields
  const [manpower, setManpower] = useState("");
  const [targetCompletion, setTargetCompletion] = useState("");
  const [duration, setDuration] = useState("");

  // Finance fields
  const [requesterDept, setRequesterDept] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    role: string;
    department: string;
    suboffice: string;
  } | null>(null);
  const [requestDept, setRequestDept] = useState(""); // For dropdown selection
  const [subofficeEDOMD, setSubofficeEDOMD] = useState(""); // For suboffice: "engineering" or "operations_maintenance"

  // Fetch user info on mount
  useEffect(() => {
    axios.get("/authentication/me/").then((res) => {
      setUserInfo(res.data);
      setDepartment(res.data.department)
    });
  }, []);

  // Determine if user should see the dropdown
  const showDeptDropdown =
    userInfo &&
    ((userInfo.role === "employee" &&
      (userInfo.department === "engineering" ||
        userInfo.department === "operations_maintenance")) ||
      userInfo.role === "sub_office");

  // For suboffice, if they choose ED/OMD, they must pick which one
  const showSubofficeEDOMDSelect =
    userInfo &&
    userInfo.role === "sub_office" &&
    requestDept === "engineering";

  // The department to use for the request
  const effectiveDept =
    showSubofficeEDOMDSelect && subofficeEDOMD
      ? subofficeEDOMD
      : showDeptDropdown
      ? requestDept
      : userInfo?.department || "finance";

  // Auto-populate materials based on department
  useEffect(() => {
    if (effectiveDept) {
      axios
        .get(`/inventory-by-department/?department=${effectiveDept}`)
        .then((res) => {
          // Fix: build material objects if needed
          setMaterials(
            res.data.map((inv) =>
              typeof inv.material === "object"
                ? inv.material
                : {
                    id: inv.material,
                    name: inv.material_name,
                    unit: inv.unit,
                  }
            )
          );
        });
    }
  }, [effectiveDept]);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (items.length === 0) {
      toast.error("Please add at least one item to your request.");
      return;
    }

    setSubmitting(true);

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
      department: effectiveDept,
      items: formattedItems,
      purpose,
      location,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
    };

    if (department === "finance") {
      payload.requester_department = requesterDept;
    } else {
      payload.manpower = manpower;
      payload.target_completion = formatDate(targetCompletion);
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
      setDuration("");
      setRequesterDept("");
      setRequestDept("");         // <-- clear department dropdown
      setSubofficeEDOMD("");      // <-- clear suboffice ED/OMD select
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.detail ||
        "Failed to submit. Please review the form.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!userInfo && typeof window !== "undefined") {
    return <FormLoader />;
  }

  return (
    <Card
      className="p-6 w-full mx-auto space-y-4
        bg-white/40 dark:bg-zinc-900/60
        shadow-lg backdrop-blur-[4.5px] select-none"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">New Material Request</h1>
        {children}
      </div>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Department Dropdown (only for ED/OMD employee or sub_office) */}
        {showDeptDropdown && (
          <div>
            <Label className="p-2">Request For</Label>
            <Select onValueChange={setRequestDept} value={requestDept}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {userInfo && userInfo.role === "sub_office" ? (
                  <>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="operations_maintenance">Operations & Maintenance</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </>
                ) : userInfo && userInfo.department ? (
                  <>
                    <SelectItem value={userInfo.department}>
                      {userInfo.department.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </>
                ) : null}
              </SelectContent>
            </Select>
          </div>
        )}


        {/* Purpose and Location side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purpose */}
          {effectiveDept === "finance" ? (
            <FinanceFields
              values={{
                requester_department:
                  userInfo && userInfo.role !== "sub_office" && userInfo.department
                    ? userInfo.department
                    : "",
                purpose,
              }}
              onChange={(field, value) => {
                if (field === "purpose") setPurpose(value);
              }}
              departmentDisabled={true}
            />
          ) : effectiveDept ? (
            <EngOpFields
              values={{
                purpose,
                manpower,
                target_completion: targetCompletion,
              }}
              onChange={(field, value) => {
                if (field === "purpose") setPurpose(value);
                if (field === "manpower") setManpower(value);
                if (field === "target_completion") setTargetCompletion(value);
              }}
            />
          ) : (
            <div />
          )}

          {/* Location */}
          {effectiveDept && (
            <div className="flex flex-col">
              <Label className="p-2">Location (Where materials will be used)</Label>
              <LocationInput
                value={location}
                onChange={setLocation}
                setCoordinates={setCoordinates}
                coordinates={coordinates}
              />
            </div>
          )}
        </div>

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
                      onChange={(e) => updateItem(i, "custom_name", e.target.value)}
                      className="w-64"
                    />
                    <Input
                      placeholder="Custom unit"
                      value={item.custom_unit || ""}
                      onChange={(e) => updateItem(i, "custom_unit", e.target.value)}
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
                    <Combobox
                      options={[
                        ...materials.map((mat) => ({
                          value: mat.id.toString(),
                          label: `${mat.name} (${mat.unit})`,
                        })),
                        { value: "custom", label: "➕ Add Custom Material" },
                      ]}
                      value={
                        item.is_custom
                          ? "custom"
                          : item.material_id !== undefined
                          ? item.material_id.toString()
                          : ""
                      }
                      onChange={(val) => {
                        if (val === "custom") {
                          updateItem(i, "is_custom", true);
                          updateItem(i, "material_id", undefined);
                          updateItem(i, "unit", "");
                          updateItem(i, "custom_name", "");
                          updateItem(i, "custom_unit", "");
                        } else {
                          const mat = materials.find((m) => m.id === Number(val));
                          if (mat) {
                            updateItem(i, "is_custom", false);
                            updateItem(i, "material_id", Number(val));
                            updateItem(i, "unit", mat.unit);
                            updateItem(i, "custom_name", undefined);
                            updateItem(i, "custom_unit", undefined);
                          }
                        }
                      }}
                      placeholder="Select material"
                      searchPlaceholder="Search material..."
                      className="w-[280px]"
                    />
                    <Input
                      placeholder="Unit"
                      value={item.is_custom ? item.custom_unit || "" : materials.find((m) => m.id === item.material_id)?.unit || ""}
                      disabled={!item.is_custom}
                      className="w-32 ml-6"
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
          <Button type="button" variant="outline" onClick={addItem} className="mr-3">
            + Add Item
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setItems([...items, { is_custom: true, quantity: 1, unit: "" }])}
          >
            + Add Custom Item
          </Button>

          <ConfirmActionDialog
            trigger={
              <Button
                type="submit"
                className="w-full"
                disabled={items.length === 0 || submitting}
              >
                Submit Request
              </Button>
            }
            title="Submit Material Request?"
            description="Do you want to continue with this action? This cannot be undone."
            confirmLabel="Submit"
            cancelLabel="Cancel"
            onConfirm={handleSubmit}
            loading={submitting}
          />
        </div>
      </form>
    </Card>
  );
}

function LocationInput({
  value,
  onChange,
  setCoordinates,
  coordinates,
}: {
  value: string;
  onChange: (val: string) => void;
  setCoordinates: (coords: { lat: number; lng: number } | null) => void;
  coordinates: { lat: number; lng: number } | null;
}) {
  const [loading, setLoading] = useState(false);
  const LOCATIONIQ_API_KEY = "pk.8e5ac7da0c927fe19d6d2f1fbd26e732";

  // Forward geocode on blur
  const handleBlur = async () => {
    if (!value) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/requests/geocode/?q=${encodeURIComponent(value)}`
      );
      if (res.data?.length > 0) {
        const best = res.data[0];
        setCoordinates({ lat: parseFloat(best.lat), lng: parseFloat(best.lon) });
      } else {
        setCoordinates(null);
      }
    } catch {
      setCoordinates(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1 relative">
      <Input
        placeholder="Enter location"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setCoordinates(null);
        }}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {loading && <div className="text-xs text-muted-foreground">Searching...</div>}
      {coordinates && (
        <p className="text-sm text-muted-foreground">
          📍 Lat: {coordinates.lat.toFixed(5)}, Lng: {coordinates.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}

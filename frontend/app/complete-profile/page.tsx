"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "@/lib/axios";

export default function CompleteProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user;
      setForm((prev) => ({
        ...prev,
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
      }));
    }
  }, [session, status]);

  const handleSubmit = async () => {
    try {
      await axios.post("/api/profile/update", form);
      toast.success("Profile updated successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto mt-12 space-y-4">
      <h2 className="text-2xl font-bold">Complete Your Profile</h2>

      <Input
        placeholder="First Name"
        value={form.first_name}
        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
      />
      <Input
        placeholder="Last Name"
        value={form.last_name}
        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
      />
      <Select onValueChange={(value) => setForm({ ...form, role: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Select a Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="warehouse_staff">Warehouse Staff</SelectItem>
          <SelectItem value="budget_analyst">Budget Analyst</SelectItem>
          <SelectItem value="engineering">Engineering Dept.</SelectItem>
          <SelectItem value="operations_maintenance">Operations & Maintenance Dept.</SelectItem>
          <SelectItem value="warehouse_admin">Warehouse Admin</SelectItem>
          <SelectItem value="manager">General Manager</SelectItem>
          <SelectItem value="employee">Employee</SelectItem>
          <SelectItem value="sub_office">Sub Office</SelectItem>
          <SelectItem value="finance">Finance Dept.</SelectItem>
          <SelectItem value="audit">Audit Dept.</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}

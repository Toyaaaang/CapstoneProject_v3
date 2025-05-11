"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/lib/axios";

interface EditNameDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  initialFirstName: string;
  initialLastName: string;
  refresh?: () => void; // optional callback
}

export default function EditNameDialog({
  open,
  onOpenChange,
  initialFirstName,
  initialLastName,
  refresh,
}: EditNameDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFirstName(""); // always empty to start
      setLastName("");
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.patch("/authentication/account/", {
        first_name: firstName || initialFirstName,
        last_name: lastName || initialLastName,
      });
      toast.success("Name updated successfully");
      onOpenChange(false);
      refresh?.();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Your Name</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder={`${initialFirstName} (First Name)`}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            placeholder={`${initialLastName} (Last Name)`}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

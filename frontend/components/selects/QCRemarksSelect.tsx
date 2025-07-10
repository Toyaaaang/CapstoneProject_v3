"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const REMARK_OPTIONS = [
  "Minor scratches",
  "Incomplete labeling",
  "Damaged packaging",
  "Requires further inspection",
  "No issues detected",
];

export default function QCRemarksSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="pl-1 text-sm">Remarks</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select remark..." />
        </SelectTrigger>
        <SelectContent>
          {REMARK_OPTIONS.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
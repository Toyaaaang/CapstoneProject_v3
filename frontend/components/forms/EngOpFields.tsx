import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
type Props = {
  values: any;
  onChange: (field: string, value: any) => void;
};
const PURPOSE_OPTIONS = [
  { value: "Maintenance", label: "Maintenance – Preventive maintenance, upkeep" },
  { value: "Power Restoration", label: "Power Restoration – After typhoons or outages" },
  { value: "System Expansion", label: "System Expansion – Line extension, sitios" },
  { value: "Equipment Replacement", label: "Equipment Replacement – Damaged, outdated items" },
  { value: "Emergency Response", label: "Emergency Response – Urgent repair" },
  { value: "Buffer Stock", label: "Buffer Stock – Standby reserve" },
  { value: "Metering Projects", label: "Metering/Clustering – Feeder meters, clustering" },
  { value: "New Service Connections", label: "New Service – Consumer installations" },
  { value: "Office Needs", label: "Office/Sub-office – Electrical branch needs" },
  { value: "Special Projects", label: "Special Projects – BAPA, NEA, subsidies" },
];
export default function EngOpFields({ values, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Purpose */}
      <div>
        <Label className="p-2">Purpose</Label>
        <Select
          value={values.purpose}
          onValueChange={(value) => onChange("purpose", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select purpose..." />
          </SelectTrigger>
          <SelectContent>
            {PURPOSE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Target Date + Actual Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="p-2">Target Date of Completion</Label>
          <Input
            type="date"
            value={values.target_completion}
            onChange={(e) => onChange("target_completion", e.target.value)}
          />
        </div>
        <div>
          <Label className="p-2">Actual Date of Completion</Label>
          <Input
            type="date"
            value={values.actual_completion}
            onChange={(e) => onChange("actual_completion", e.target.value)}
          />
        </div>
      </div>

      {/* Duration + Manpower */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="p-2">Duration</Label>
          <Input
            placeholder="e.g. 3 days (optional)"
            value={values.duration}
            onChange={(e) => onChange("duration", e.target.value)}
          />
        </div>
        <div>
          <Label className="p-2">Manpower Requirements</Label>
          <Input
            placeholder="(Optional)"
            value={values.manpower}
            onChange={(e) => onChange("manpower", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

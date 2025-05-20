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
export default function FinanceFields({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Requester's Department */}
      <div>
        <Label className="p-2">Requester's Department</Label>
        <Input
          value={values.requester_department}
          onChange={(e) => onChange("requester_department", e.target.value)}
          required
        />
      </div>

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
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  values: any;
  onChange: (field: string, value: any) => void;
};

export default function EngOpFields({ values, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Purpose */}
      <div>
        <Label className="p-2">Purpose</Label>
        <Textarea
          value={values.purpose}
          onChange={(e) => onChange("purpose", e.target.value)}
        />
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

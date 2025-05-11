import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  values: any;
  onChange: (field: string, value: any) => void;
};

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
        <Textarea
          value={values.purpose}
          onChange={(e) => onChange("purpose", e.target.value)}
          required
        />
      </div>
    </div>
  );
}

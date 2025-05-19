import axios from "@/lib/axios";

export async function startCertification(deliveryRecordId: number) {
  const res = await axios.post("/requests/certifications/start/", {
    delivery_record_id: deliveryRecordId,
  });
  return res.data; // { id: 123, ... }
}

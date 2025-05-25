import axios from "@/lib/axios";

export async function startCertification(deliveryRecordId: number) {
  try {
    const res = await axios.post("/requests/certifications/start/", {
      delivery_record_id: deliveryRecordId,
    });
    return res.data;
  } catch (err) {
    console.error("Failed to start certification", err);
    throw err;
  }
}

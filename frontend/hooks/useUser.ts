import { useEffect, useState } from "react";
import axios from "@/lib/axios";

interface UserData {
  id: number;
  username: string;
  role: string;
  is_role_confirmed: boolean;
  first_name: string;
  last_name: string;
  email: string;
}

export default function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/authentication/me/");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}

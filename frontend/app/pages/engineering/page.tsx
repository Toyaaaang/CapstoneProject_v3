"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChartAreaInteractive } from "@/components/charts/charts";
import { SectionCards } from "@/components/charts/SectionCards";

export default function EngineeringDepartmentOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Simulate loading state
  const [user, setUser] = useState<{ role: string } | null>(null); // Simulate user data

  useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => {
      const dummyUser = { role: "engineering" }; // Simulate a logged-in user with the correct role
      setUser(dummyUser);
      setLoading(false);
    }, 1000); // Simulate a delay
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login"); // Redirect if no user
      } else if (user.role !== "engineering") {
        router.push("/login"); // Redirect if the role is incorrect
      }
    }
  }, [user, loading, router]);

  if (loading) return <p className="text-center mt-10">Checking permissions...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Overview</h1>
      <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

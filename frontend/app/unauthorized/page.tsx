// app/unauthorized/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted px-4">
      <div className="max-w-md text-center bg-white shadow-xl rounded-2xl p-8 border">
        <Image
          src="/unauthorized.gif" // 🔁 Make sure you have this GIF or change the path
          alt="Access Denied"
          width={200}
          height={200}
          className="mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don’t have permission to view this page.
        </p>
        <Button
        variant="default"
        className="mt-6 w-full"
        onClick={() => router.back()}
        >
        <ArrowLeft className="mr-2" />
        Go Back
        </Button>

      </div>
    </div>
  );
}

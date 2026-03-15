"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Section page error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-red-600 font-medium">
        Une erreur est survenue : {error.message}
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}

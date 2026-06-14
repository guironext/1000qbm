import React from "react";
import { cn } from "@/lib/utils";

type GameShellProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: "3xl" | "5xl" | "6xl" | "7xl";
};

const maxWidthClass = {
  "3xl": "max-w-3xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const;

export function GameShell({
  children,
  className,
  contentClassName,
  maxWidth = "6xl",
}: GameShellProps) {
  return (
    <div className={cn("relative min-h-[70vh] overflow-hidden", className)}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.20),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.14),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.09),transparent_60%)] dark:bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.08),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.06),transparent_60%)]"
        aria-hidden
      />
      <div className="relative container mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className={cn("mx-auto", maxWidthClass[maxWidth], contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

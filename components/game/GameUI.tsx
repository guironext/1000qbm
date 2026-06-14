import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function GameBackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100/90 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}

export function GameBadge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "amber" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm",
        variant === "amber" &&
          "border-amber-200/80 bg-white/80 text-amber-900 dark:border-amber-700/40 dark:bg-gray-900/70 dark:text-amber-200",
        variant === "muted" &&
          "border-gray-200/80 bg-white/70 text-gray-700 dark:border-gray-700/60 dark:bg-gray-900/60 dark:text-gray-200",
        variant === "default" &&
          "border-amber-200/80 bg-amber-50/80 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GamePageHeader({
  title,
  subtitle,
  badges,
  progress,
}: {
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  progress?: { current: number; total: number; label?: string };
}) {
  const pct =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        {badges ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{badges}</div>
        ) : null}
      </div>

      {progress && progress.total > 0 ? (
        <div className="rounded-2xl border border-amber-200/60 bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-sm dark:border-amber-900/40 dark:bg-gray-900/50 dark:ring-white/10 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {progress.label ?? "Progression"}
            </span>
            <span className="tabular-nums font-bold text-amber-700 dark:text-amber-300">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-gray-200/90 dark:bg-gray-800"
            role="progressbar"
            aria-valuenow={progress.current}
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-label={progress.label ?? "Progression"}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function GameCardShell({
  children,
  interactive = false,
  className,
}: {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white/90 shadow-lg ring-1 ring-black/5 dark:bg-gray-800/90 dark:shadow-black/40",
        interactive
          ? "group border-amber-200/70 shadow-amber-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/15 dark:border-amber-500/60"
          : "cursor-not-allowed border-gray-200/90 opacity-90 grayscale-[0.35] dark:border-gray-700 dark:bg-gray-900/70",
        className,
      )}
    >
      {interactive ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        >
          <div className="absolute -inset-24 bg-[radial-gradient(closest-side,rgba(251,191,36,0.28),transparent)] blur-2xl" />
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function GameMediaCard({
  imageSrc,
  remote,
  alt,
  overlay,
  badge,
  sizes = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px",
  aspect = "16/10",
}: {
  imageSrc: string;
  remote: boolean;
  alt: string;
  overlay?: React.ReactNode;
  badge?: React.ReactNode;
  sizes?: string;
  aspect?: "16/10" | "4/3" | "4/5";
}) {
  const aspectClass =
    aspect === "4/3"
      ? "aspect-[4/3]"
      : aspect === "4/5"
        ? "aspect-[4/5]"
        : "aspect-[16/10]";

  return (
    <div
      className={cn(
        "relative w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
        aspectClass,
      )}
    >
      {remote ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes={sizes}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-95"
        aria-hidden
      />
      {badge}
      {overlay}
    </div>
  );
}

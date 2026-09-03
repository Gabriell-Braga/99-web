import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "@/components/ui/Icon";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("animate-skeleton rounded-lg bg-offwhite-99", className)}
    />
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-3 py-8" : "gap-4 py-16",
        className,
      )}
    >
      <Icon name={icon} size={compact ? 48 : 64} className="text-border-99" strokeWidth={1.4} />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-99">{description}</p>
      </div>
      <div className="mt-2">{action}</div>
    </div>
  );
}

interface ErrorNoteProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorNote({ title, description, action, className }: ErrorNoteProps) {
  return (
    <div
      role="alert"
      className={cx("flex gap-3 rounded-xl bg-orange-99-bg p-4 text-orange-99-text", className)}
    >
      <Icon name="alert" className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-secondary-99">{description}</p>
        </div>
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}

export function InfoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex gap-3 rounded-xl bg-subtle-99 p-4 text-sm text-secondary-99", className)}>
      <Icon name="info" className="mt-0.5 shrink-0 text-info-99" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Texto abaixo de um CTA desabilitado dizendo o que falta. */
export function BlockedHint({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <p className="text-center text-[13px] text-muted-99" aria-live="polite">
      Falta {items.join(", ")}.
    </p>
  );
}

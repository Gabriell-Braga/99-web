import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-16", className)}>
      {children}
    </div>
  );
}

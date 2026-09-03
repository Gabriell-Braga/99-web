"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/Icon";

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  id: string;
  children: ReactNode;
  className?: string;
  trailing?: ReactNode;
}

function FieldShell({ label, hint, error, id, children, className, trailing }: FieldShellProps) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-2", className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={id} className="text-sm font-medium text-secondary-99">
            {label}
          </label>
          {trailing}
        </div>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-[13px] text-orange-99-text">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-muted-99">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border bg-white px-4 text-base text-black-99 transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-black-99 focus:ring-2 focus:ring-black-99/10 disabled:bg-subtle-99 disabled:text-disabled-99";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leading, trailing, className, wrapperClassName, id: idProp, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <FieldShell label={label} hint={hint} error={error} id={id} className={wrapperClassName}>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-99">
            {leading}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cx(
            inputBase,
            "h-12",
            error ? "border-orange-99" : "border-border-99",
            leading ? "pl-12" : null,
            trailing ? "pr-12" : null,
            className,
          )}
          {...rest}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>
        )}
      </div>
    </FieldShell>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  labelTrailing?: ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, wrapperClassName, labelTrailing, id: idProp, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      id={id}
      className={wrapperClassName}
      trailing={labelTrailing}
    >
      <textarea
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cx(
          inputBase,
          "min-h-24 resize-y py-3",
          error ? "border-orange-99" : "border-border-99",
          className,
        )}
        {...rest}
      />
    </FieldShell>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, wrapperClassName, id: idProp, children, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <FieldShell label={label} hint={hint} error={error} id={id} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cx(
            inputBase,
            "h-12 appearance-none pr-10",
            error ? "border-orange-99" : "border-border-99",
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-99"
        />
      </div>
    </FieldShell>
  );
});

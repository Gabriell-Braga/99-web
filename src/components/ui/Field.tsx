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

/**
 * Campos de formulário do 99. O padrão do app é o campo sem borda: rótulo em
 * 13px, valor em 17px, divisor fino abaixo. A variante "boxed" mantém a caixa
 * para campos isolados como busca e cupom.
 */
type Variant = "plain" | "boxed";

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  id: string;
  children: ReactNode;
  className?: string;
  trailing?: ReactNode;
  variant: Variant;
}

function FieldShell({ label, hint, error, required, id, children, className, trailing, variant }: FieldShellProps) {
  return (
    <div
      className={cx(
        "flex min-w-0 flex-col",
        variant === "plain" ? "gap-1 border-b py-2 transition-colors duration-150" : "gap-2",
        // O campo sem borda marca o foco escurecendo o divisor, sem caixa em volta.
        variant === "plain" && (error ? "border-orange-99" : "border-border-99 focus-within:border-black-99"),
        className,
      )}
    >
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={id} className="text-[13px] text-secondary-99">
            {label}
            {required && (
              <span className="text-alert-99" aria-hidden="true">
                {" "}
                *
              </span>
            )}
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

const boxedBase =
  "w-full rounded-xl border bg-white px-4 text-base text-black-99 transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-black-99 focus:ring-2 focus:ring-black-99/10 disabled:bg-subtle-99 disabled:text-disabled-99";

const plainBase =
  "w-full bg-transparent px-0 text-[17px] text-black-99 outline-none focus:outline-none focus-visible:outline-none disabled:text-disabled-99";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  wrapperClassName?: string;
  variant?: Variant;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leading, trailing, className, wrapperClassName, id: idProp, required, variant = "plain", ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const plain = variant === "plain";
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      id={id}
      className={wrapperClassName}
      variant={variant}
    >
      <div className="relative">
        {leading && (
          <span
            className={cx(
              "pointer-events-none absolute inset-y-0 flex items-center text-muted-99",
              plain ? "left-0" : "left-4",
            )}
          >
            {leading}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cx(
            plain ? cx(plainBase, "h-8") : cx(boxedBase, "h-12", error ? "border-orange-99" : "border-border-99"),
            leading ? (plain ? "pl-8" : "pl-12") : null,
            trailing ? (plain ? "pr-8" : "pr-12") : null,
            className,
          )}
          {...rest}
        />
        {trailing && (
          <span className={cx("absolute inset-y-0 flex items-center", plain ? "right-0" : "right-2")}>{trailing}</span>
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
  variant?: Variant;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, wrapperClassName, labelTrailing, id: idProp, required, variant = "plain", ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const plain = variant === "plain";
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      id={id}
      className={wrapperClassName}
      trailing={labelTrailing}
      variant={variant}
    >
      <textarea
        ref={ref}
        id={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cx(
          plain ? cx(plainBase, "min-h-16 resize-y py-1") : cx(boxedBase, "min-h-24 resize-y py-3", error ? "border-orange-99" : "border-border-99"),
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
  variant?: Variant;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, wrapperClassName, id: idProp, required, children, variant = "plain", ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const plain = variant === "plain";
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      id={id}
      className={wrapperClassName}
      variant={variant}
    >
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cx(
            plain ? cx(plainBase, "h-8 appearance-none pr-8") : cx(boxedBase, "h-12 appearance-none pr-10", error ? "border-orange-99" : "border-border-99"),
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <Icon
          name="chevronDown"
          className={cx("pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-99", plain ? "right-0" : "right-4")}
        />
      </div>
    </FieldShell>
  );
});

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Icon, type IconName } from "@/components/ui/Icon";

export interface Servico {
  href: string;
  title: string;
  description: string;
  icon: IconName;
  cta: string;
}

/**
 * Cards dos serviços. Entram um a um quando a seção aparece e reagem ao mouse:
 * o card sobe, o selo do ícone cresce e a seta anda para a direita. Parado para
 * quem pede menos movimento.
 */
export function ServiceCards({ items }: { items: Servico[] }) {
  const reduce = useReducedMotion();

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
      {items.map((s, i) => (
        <motion.li
          key={s.title}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : i * 0.08, ease: [0.33, 0, 0.2, 1] }}
        >
          <Link
            href={s.href}
            className="group flex h-full flex-col gap-3 rounded-2xl bg-white p-6 transition-[translate,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.33,0,0.2,1)] hover:-translate-y-1 hover:shadow-high motion-reduce:hover:translate-y-0"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-99 text-black-99 transition-[scale] duration-300 ease-[cubic-bezier(0.33,0,0.2,1)] group-hover:scale-110 motion-reduce:group-hover:scale-100"
              aria-hidden="true"
            >
              <Icon name={s.icon} size={24} />
            </span>
            <span className="text-[20px] font-bold">{s.title}</span>
            <span className="text-[15px] text-secondary-99">{s.description}</span>
            <span className="mt-auto inline-flex items-center gap-2 pt-3 text-[15px] font-bold text-black-99">
              {s.cta}
              <Icon
                name="arrowRight"
                size={18}
                className="transition-[translate] duration-300 ease-[cubic-bezier(0.33,0,0.2,1)] group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
              />
            </span>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}

import Link from "next/link";
import { Icon } from "./Icon";
import type { Service } from "@/lib/data";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={service.href} className="card card-hover group flex flex-col p-6">
      <span
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${service.accent} text-navy`}
      >
        <Icon name={service.icon} className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-bold text-navy">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-navy/60">
        {service.description}
      </p>
      <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue group-hover:gap-1.5">
        Explore <span className="transition-all group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}

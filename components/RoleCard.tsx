import Link from "next/link";
import { Icon } from "./Icon";
import type { Role } from "@/lib/data";

export function RoleCard({ role }: { role: Role }) {
  return (
    <div className="card card-hover flex flex-col p-6">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue/10 text-blue">
        <Icon name={role.icon} className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-bold text-navy">{role.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy/60">{role.description}</p>
      <ul className="mt-4 space-y-2">
        {role.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-navy/70">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
            {f}
          </li>
        ))}
      </ul>
      <Link href={role.href} className="btn-primary mt-6 w-full py-2.5 text-sm">
        {role.cta}
      </Link>
    </div>
  );
}

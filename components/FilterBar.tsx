import { Icon } from "./Icon";

export function FilterBar({
  fields,
  chips,
}: {
  fields: { placeholder: string; type?: string }[];
  chips?: string[];
}) {
  return (
    <div className="card -mt-10 relative z-10 p-4">
      <form className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))_auto] sm:items-center">
        {fields.map((f, i) => (
          <input
            key={i}
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            className="w-full rounded-xl border border-soft-200 bg-soft/50 px-4 py-3 text-sm text-navy placeholder:text-navy/40 focus:border-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue/15"
          />
        ))}
        <button type="button" className="btn-gold px-6 py-3">
          <Icon name="sparkles" className="h-4 w-4" /> Search
        </button>
      </form>
      {chips && chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

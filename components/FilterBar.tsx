"use client";

import { useState } from "react";
import { Icon } from "./Icon";

export interface FilterBarProps {
  fields: { key?: string; placeholder: string; type?: string }[];
  chips?: string[];
  onSearch?: (values: Record<string, string>, selectedChips: string[]) => void;
  className?: string;
}

export function FilterBar({ fields, chips = [], onSearch, className = "" }: FilterBarProps) {
  const [values, setValues]           = useState<Record<string, string>>({});
  const [selectedChips, setSelected]  = useState<string[]>([]);

  function toggleChip(chip: string) {
    setSelected((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(values, selectedChips);
  }

  // If no external handler, fire immediately on chip toggle
  function handleChipToggle(chip: string) {
    const next = selectedChips.includes(chip)
      ? selectedChips.filter((c) => c !== chip)
      : [...selectedChips, chip];
    setSelected(next);
    onSearch?.(values, next);
  }

  return (
    <div className={`card -mt-10 relative z-10 p-4 ${className}`}>
      <form onSubmit={handleSearch} className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))_auto] sm:items-center">
        {fields.map((f, i) => {
          const key = f.key ?? String(i);
          return (
            <input
              key={key}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              value={values[key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="input bg-soft/80 focus:bg-white"
            />
          );
        })}
        <button type="submit" className="btn-gold px-6 py-3">
          <Icon name="sparkles" className="h-4 w-4" /> Search
        </button>
      </form>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleChipToggle(c)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                selectedChips.includes(c)
                  ? "border-blue bg-blue text-white shadow-[var(--shadow-glow)]"
                  : "border-soft-200 bg-white text-muted hover:border-gold/40 hover:bg-[var(--gtv-hover-gold)] hover:text-navy"
              }`}
            >
              {c}
            </button>
          ))}
          {selectedChips.length > 0 && (
            <button
              type="button"
              onClick={() => { setSelected([]); onSearch?.(values, []); }}
              className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-100 transition-colors"
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

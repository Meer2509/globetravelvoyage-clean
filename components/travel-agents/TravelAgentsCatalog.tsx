"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { Stars } from "@/components/Stars";
import { EMPTY_MARKETPLACE_LABEL } from "@/lib/launch-trust";
import type { TravelAgentProfileRow } from "@/lib/supabase/travel-agent-types";

export function TravelAgentsCatalog({ agents }: { agents: TravelAgentProfileRow[] }) {
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  const specialtyChips = useMemo(
    () => [...new Set(agents.flatMap((a) => a.specialties))].slice(0, 10),
    [agents]
  );
  const countryChips = useMemo(
    () => [...new Set(agents.flatMap((a) => a.countries_served))].slice(0, 10),
    [agents]
  );

  function handleSearch(_values: Record<string, string>, selectedChips: string[]) {
    setSearch(_values["0"] ?? "");
    setChips(selectedChips);
  }

  const filtered = useMemo(() => {
    let list = agents;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          (a.agency_name ?? "").toLowerCase().includes(q) ||
          a.specialties.some((s) => s.toLowerCase().includes(q)) ||
          a.countries_served.some((c) => c.toLowerCase().includes(q))
      );
    }
    for (const chip of chips) {
      list = list.filter(
        (a) => a.specialties.includes(chip) || a.countries_served.includes(chip)
      );
    }
    return list;
  }, [agents, search, chips]);

  return (
    <>
      <div className="container-px">
        <FilterBar
          fields={[{ key: "0", placeholder: "Search by name, specialty, or country…" }]}
          chips={[...specialtyChips, ...countryChips]}
          onSearch={handleSearch}
        />
      </div>

      <div className="container-px pt-8 pb-12">
        <p className="mb-5 text-sm text-muted">
          {agents.length === 0
            ? EMPTY_MARKETPLACE_LABEL
            : `${filtered.length} verified travel agent${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {agents.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center px-6">
            <p className="text-4xl mb-3">👔</p>
            <p className="font-semibold text-navy text-lg">{EMPTY_MARKETPLACE_LABEL}</p>
            <p className="mt-2 text-sm text-muted max-w-md mx-auto">
              Verified agents appear here once approved by our admin team.
            </p>
            <Link href="/register?role=agent" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
              Become a travel agent
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
            <p className="font-semibold text-navy">No agents match your search</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((agent) => (
              <Link
                key={agent.id}
                href={`/travel-agents/${agent.id}`}
                className="card card-hover flex flex-col p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-lg font-bold text-navy">
                    {agent.full_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-navy truncate">{agent.full_name}</h3>
                      {agent.featured && (
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                          Featured
                        </span>
                      )}
                    </div>
                    {agent.agency_name && (
                      <p className="text-sm text-muted truncate">{agent.agency_name}</p>
                    )}
                    <div className="mt-1 flex items-center gap-1">
                      {(agent.review_count ?? 0) > 0 ? (
                        <>
                          <Stars rating={agent.rating ?? 0} reviews={agent.review_count ?? 0} />
                          <span className="text-xs text-muted">({agent.review_count})</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted">Verified provider</span>
                      )}
                    </div>
                  </div>
                </div>
                {agent.bio && (
                  <p className="mt-3 text-sm text-charcoal/65 line-clamp-2">{agent.bio}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-1">
                  {agent.specialties.slice(0, 3).map((s) => (
                    <span key={s} className="chip text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs font-semibold text-blue">View profile →</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

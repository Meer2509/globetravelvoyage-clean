import { Stars } from "@/components/Stars";
import { TrustScoreBadge, VerificationLevelBadge } from "@/components/trust/TrustScoreBadge";
import type { PublicTrustProfile } from "@/lib/trust/types";

export function PublicTrustProfileCard({
  profile,
  className = "",
}: {
  profile: PublicTrustProfile;
  className?: string;
}) {
  if (profile.isSuspended) return null;

  return (
    <div className={`rounded-2xl border border-soft-200 bg-white p-5 shadow-[var(--shadow-card)] ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-charcoal/45">Trust profile</p>
        <VerificationLevelBadge level={profile.verificationLevel} />
        <TrustScoreBadge score={profile.trustScore} tier={profile.badgeTier} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Trust score" value={`${profile.trustScore}/100`} />
        <Stat label="Response rate" value={`${profile.responseRate}%`} />
        <Stat
          label="Reviews"
          value={
            profile.reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Stars rating={profile.reviewAverage} />
                <span className="text-sm">({profile.reviewCount})</span>
              </span>
            ) : (
              "—"
            )
          }
        />
        <Stat label="Completed" value={String(profile.completedServices)} sub="services" />
      </div>

      {profile.website && (
        <p className="mt-3 text-xs text-charcoal/55">
          Website:{" "}
          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        </p>
      )}

      {Object.keys(profile.socialLinks).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(profile.socialLinks).map(([key, url]) =>
            url ? (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue hover:underline capitalize"
              >
                {key}
              </a>
            ) : null
          )}
        </div>
      )}

      <p className="mt-3 text-[10px] text-charcoal/40">
        Independent marketplace — verification and trust scores reflect provider activity on Globe Travel Voyage.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-soft px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase text-charcoal/45">{label}</p>
      <div className="mt-0.5 font-extrabold text-navy">{value}</div>
      {sub && <p className="text-[10px] text-charcoal/45">{sub}</p>}
    </div>
  );
}

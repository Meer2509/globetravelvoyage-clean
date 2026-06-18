import type { TrustBadgeTier, TrustScoreRow, VerificationLevel } from "./types";

const LEVEL_PTS: Record<VerificationLevel, number> = {
  basic: 10,
  verified: 20,
  premium_verified: 25,
};

function badgeFromScore(score: number, level: VerificationLevel): TrustBadgeTier {
  if (level === "premium_verified" && score >= 85) return "elite";
  if (level === "premium_verified") return "premium";
  if (level === "verified" && score >= 70) return "verified";
  if (level === "verified") return "verified";
  if (score >= 40) return "basic";
  return "none";
}

export interface TrustScoreInput {
  userId: string;
  providerRole: string;
  verificationLevel: VerificationLevel;
  profileCompletion: number;
  reviewAverage: number;
  reviewCount: number;
  responseRate: number;
  completionRate: number;
  accountAgeDays: number;
}

export function computeTrustScore(input: TrustScoreInput): Omit<TrustScoreRow, "calculated_at"> {
  const verification_pts = LEVEL_PTS[input.verificationLevel] ?? 5;
  const profile_pts = Math.round(Math.min(15, (input.profileCompletion / 100) * 15));
  const review_pts = Math.round(
    Math.min(25, (input.reviewAverage / 5) * 15 + Math.min(10, input.reviewCount))
  );
  const response_pts = Math.round(Math.min(15, input.responseRate * 15));
  const completion_pts = Math.round(Math.min(15, input.completionRate * 15));
  const age_pts = Math.min(5, Math.floor(input.accountAgeDays / 90));

  const trust_score = Math.min(
    100,
    verification_pts + profile_pts + review_pts + response_pts + completion_pts + age_pts
  );

  return {
    user_id: input.userId,
    provider_role: input.providerRole,
    trust_score,
    verification_pts,
    profile_pts,
    review_pts,
    response_pts,
    completion_pts,
    age_pts,
    badge_tier: badgeFromScore(trust_score, input.verificationLevel),
  };
}

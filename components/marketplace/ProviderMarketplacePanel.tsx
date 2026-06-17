"use client";

import { useEffect, useState } from "react";
import { fetchReviewsForTarget } from "@/lib/supabase/review-actions";
import { ReviewForm, ReviewList } from "@/components/reviews/ReviewPanel";
import { MessageProviderButton } from "@/components/messaging/MessageProviderButton";

export function ProviderMarketplacePanel({
  targetType,
  targetId,
  providerUserId,
  providerName,
}: {
  targetType: "agency" | "visa_agent";
  targetId: string;
  providerUserId: string;
  providerName: string;
}) {
  const [reviews, setReviews] = useState<
    Awaited<ReturnType<typeof fetchReviewsForTarget>>
  >([]);

  function reload() {
    fetchReviewsForTarget(targetType, targetId).then(setReviews);
  }

  useEffect(() => {
    reload();
  }, [targetType, targetId]);

  return (
    <div className="space-y-6">
      <MessageProviderButton providerUserId={providerUserId} providerName={providerName} />
      <div>
        <h3 className="mb-3 text-sm font-extrabold text-navy">Reviews</h3>
        <ReviewList reviews={reviews} />
      </div>
      <ReviewForm
        targetType={targetType}
        targetId={targetId}
        targetName={providerName}
        onSubmitted={reload}
      />
    </div>
  );
}

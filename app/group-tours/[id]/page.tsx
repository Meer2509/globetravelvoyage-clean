import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Stars } from "@/components/Stars";
import { Disclaimer } from "@/components/Disclaimer";
import { ReviewForm, ReviewList } from "@/components/reviews/ReviewPanel";
import { GroupTourJoinForm } from "@/components/group-tours/GroupTourJoinForm";
import { fetchPublicGroupTourById } from "@/lib/supabase/group-tour-actions";
import { fetchReviewsForTarget } from "@/lib/supabase/review-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tour = await fetchPublicGroupTourById(id);
  if (!tour) return { title: "Group tour not found" };
  return {
    title: `${tour.title} — Group Tour`,
    description: tour.description ?? `Group tour to ${tour.destination} on Globe Travel Voyage.`,
  };
}

export default async function GroupTourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tour, reviews] = await Promise.all([
    fetchPublicGroupTourById(id),
    fetchReviewsForTarget("group_tour", id),
  ]);

  if (!tour) notFound();

  const seatsLeft = tour.seat_limit - tour.seats_booked;

  return (
    <div className="min-h-screen bg-soft/50">
      <div className="bg-hero-gradient py-10">
        <div className="container-px">
          <Link href="/group-tours" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80">
            ← All group tours
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {tour.featured && <span className="eyebrow-white mb-2">Featured departure</span>}
              <h1 className="text-3xl font-extrabold text-white">{tour.title}</h1>
              <p className="mt-1 text-white/70">{tour.destination}</p>
              {tour.agent_name && (
                <p className="mt-2 text-sm text-white/55">
                  Hosted by {tour.agent_name}{tour.agency_name ? ` · ${tour.agency_name}` : ""}
                </p>
              )}
            </div>
            <div className="text-right">
              {tour.price != null && (
                <p className="text-2xl font-extrabold text-gold">
                  {tour.currency} {Number(tour.price).toLocaleString()}
                </p>
              )}
              <p className="text-xs text-white/50">per person · {seatsLeft} seats left</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {tour.description && (
              <div className="card p-6">
                <h2 className="font-bold text-navy mb-2">Overview</h2>
                <p className="text-sm text-charcoal/65 leading-relaxed whitespace-pre-wrap">{tour.description}</p>
              </div>
            )}

            {(tour.start_date || tour.end_date) && (
              <div className="card p-6">
                <h2 className="font-bold text-navy mb-2">Dates</h2>
                <p className="text-sm text-charcoal/65">
                  {tour.start_date && new Date(tour.start_date).toLocaleDateString(undefined, { dateStyle: "long" })}
                  {tour.end_date && ` → ${new Date(tour.end_date).toLocaleDateString(undefined, { dateStyle: "long" })}`}
                </p>
              </div>
            )}

            {tour.itinerary && (
              <div className="card p-6">
                <h2 className="font-bold text-navy mb-2">Itinerary</h2>
                <pre className="whitespace-pre-wrap text-sm text-charcoal/65 font-sans leading-relaxed">{tour.itinerary}</pre>
              </div>
            )}

            {(tour.included_items.length > 0 || tour.excluded_items.length > 0) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {tour.included_items.length > 0 && (
                  <div className="card p-5">
                    <h3 className="font-bold text-navy mb-2">Included</h3>
                    <ul className="space-y-1 text-sm text-charcoal/65">
                      {tour.included_items.map((item) => (
                        <li key={item} className="flex gap-2"><span className="text-emerald-600">✓</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tour.excluded_items.length > 0 && (
                  <div className="card p-5">
                    <h3 className="font-bold text-navy mb-2">Not included</h3>
                    <ul className="space-y-1 text-sm text-charcoal/65">
                      {tour.excluded_items.map((item) => (
                        <li key={item} className="flex gap-2"><span className="text-charcoal/35">—</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {tour.cancellation_policy && (
              <div className="card p-6">
                <h2 className="font-bold text-navy mb-2">Cancellation policy</h2>
                <p className="text-sm text-charcoal/65 whitespace-pre-wrap">{tour.cancellation_policy}</p>
              </div>
            )}

            <div className="card p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-bold text-navy">Reviews</h2>
                <Stars rating={tour.rating ?? 0} reviews={tour.review_count ?? 0} />
              </div>
              <ReviewList reviews={reviews} />
              <div className="mt-6 border-t border-soft-200 pt-6">
                <ReviewForm targetType="group_tour" targetId={tour.id} targetName={tour.title} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <GroupTourJoinForm tour={tour} />
            <Disclaimer variant="compact" />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  upsertMyTravelAgentProfile,
  saveTravelAgentService,
  deleteTravelAgentService,
  fetchMyTravelAgentProfile,
  fetchMyTravelAgentServices,
  fetchMyTravelAgentInquiries,
} from "@/lib/supabase/travel-agent-actions";
import { fetchProviderBookings, type BookingRequestRow } from "@/lib/supabase/mvp-queries";
import type {
  TravelAgentInquiryRow,
  TravelAgentProfileRow,
  TravelAgentServiceRow,
} from "@/lib/supabase/travel-agent-types";
import { joinCommaList } from "@/lib/supabase/profile-utils";

type Tab = "profile" | "services" | "inquiries" | "bookings";

export function TravelAgentMarketplacePanel({ userId }: { userId: string }) {
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<TravelAgentProfileRow | null>(null);
  const [services, setServices] = useState<TravelAgentServiceRow[]>([]);
  const [inquiries, setInquiries] = useState<TravelAgentInquiryRow[]>([]);
  const [bookings, setBookings] = useState<BookingRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    agencyName: "",
    bio: "",
    specialties: "",
    countriesServed: "",
    languages: "",
    yearsExperience: "",
    profilePhoto: "",
  });

  const [serviceForm, setServiceForm] = useState({
    id: "",
    title: "",
    description: "",
    price: "",
    priceUnit: "quote",
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function reload() {
    setLoading(true);
    const [p, s, i, b] = await Promise.all([
      fetchMyTravelAgentProfile(),
      fetchMyTravelAgentServices(),
      fetchMyTravelAgentInquiries(),
      fetchProviderBookings(userId),
    ]);
    const prof = p.profile;
    setProfile(prof);
    if (prof) {
      setProfileForm({
        fullName: prof.full_name,
        agencyName: prof.agency_name ?? "",
        bio: prof.bio ?? "",
        specialties: joinCommaList(prof.specialties),
        countriesServed: joinCommaList(prof.countries_served),
        languages: joinCommaList(prof.languages),
        yearsExperience: prof.years_experience?.toString() ?? "",
        profilePhoto: prof.profile_photo ?? "",
      });
    }
    setServices(s);
    setInquiries(i);
    setBookings(b);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, [userId]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await upsertMyTravelAgentProfile(profileForm);
    setBusy(false);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast("Profile saved — pending admin verification");
    reload();
  }

  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await saveTravelAgentService({
      id: serviceForm.id || undefined,
      title: serviceForm.title,
      description: serviceForm.description,
      price: serviceForm.price,
      priceUnit: serviceForm.priceUnit,
    });
    setBusy(false);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setServiceForm({ id: "", title: "", description: "", price: "", priceUnit: "quote" });
    showToast("Service saved");
    reload();
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Edit profile" },
    { key: "services", label: "Services" },
    { key: "inquiries", label: "Inquiries" },
    { key: "bookings", label: "Bookings" },
  ];

  if (loading) return <p className="text-sm text-muted">Loading marketplace data…</p>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="rounded-xl border border-navy/10 bg-navy px-4 py-3 text-sm font-semibold text-white">
          {toast}
        </div>
      )}

      {profile && (
        <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-navy">{profile.full_name}</p>
            <p className="text-sm text-muted capitalize">Status: {profile.verification_status}</p>
          </div>
          {profile.verification_status === "verified" && (
            <Link href={`/travel-agents/${profile.id}`} className="text-sm font-semibold text-blue hover:underline">
              View public profile →
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === t.key ? "bg-navy text-white" : "bg-soft text-charcoal/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={handleSaveProfile} className="card space-y-4 p-6">
          <h3 className="font-bold text-navy">Travel agent marketplace profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name *</label>
              <input className="input" required value={profileForm.fullName} onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Agency name</label>
              <input className="input" value={profileForm.agencyName} onChange={(e) => setProfileForm((f) => ({ ...f, agencyName: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Bio</label>
              <textarea className="input min-h-24" value={profileForm.bio} onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>
            <div>
              <label className="label">Specialties (comma-separated)</label>
              <input className="input" value={profileForm.specialties} onChange={(e) => setProfileForm((f) => ({ ...f, specialties: e.target.value }))} placeholder="Visa, Flights, Luxury tours" />
            </div>
            <div>
              <label className="label">Countries served</label>
              <input className="input" value={profileForm.countriesServed} onChange={(e) => setProfileForm((f) => ({ ...f, countriesServed: e.target.value }))} />
            </div>
            <div>
              <label className="label">Languages</label>
              <input className="input" value={profileForm.languages} onChange={(e) => setProfileForm((f) => ({ ...f, languages: e.target.value }))} />
            </div>
            <div>
              <label className="label">Years of experience</label>
              <input className="input" type="number" min="0" value={profileForm.yearsExperience} onChange={(e) => setProfileForm((f) => ({ ...f, yearsExperience: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Profile photo URL</label>
              <input className="input" value={profileForm.profilePhoto} onChange={(e) => setProfileForm((f) => ({ ...f, profilePhoto: e.target.value }))} placeholder="https://…" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
            Save profile
          </button>
        </form>
      )}

      {tab === "services" && (
        <div className="space-y-4">
          <form onSubmit={handleSaveService} className="card space-y-3 p-5">
            <h3 className="font-bold text-navy">{serviceForm.id ? "Edit service" : "Add service"}</h3>
            <input className="input" required placeholder="Service title" value={serviceForm.title} onChange={(e) => setServiceForm((f) => ({ ...f, title: e.target.value }))} />
            <textarea className="input min-h-20" placeholder="Description" value={serviceForm.description} onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))} />
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Price (optional)" value={serviceForm.price} onChange={(e) => setServiceForm((f) => ({ ...f, price: e.target.value }))} />
              <select className="input w-32" value={serviceForm.priceUnit} onChange={(e) => setServiceForm((f) => ({ ...f, priceUnit: e.target.value }))}>
                <option value="quote">Quote</option>
                <option value="hour">/ hour</option>
                <option value="trip">/ trip</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <button type="submit" disabled={busy} className="btn-primary px-5 py-2 text-sm">Save service</button>
          </form>
          {services.length === 0 ? (
            <p className="text-sm text-muted">No services yet.</p>
          ) : (
            services.map((s) => (
              <div key={s.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold text-navy">{s.title}</p>
                  <p className="text-sm text-muted">{s.description ?? "—"}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="text-xs font-semibold text-blue" onClick={() => setServiceForm({ id: s.id, title: s.title, description: s.description ?? "", price: s.price?.toString() ?? "", priceUnit: s.price_unit ?? "quote" })}>Edit</button>
                  <button type="button" className="text-xs font-semibold text-red-600" onClick={async () => { await deleteTravelAgentService(s.id); reload(); }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "inquiries" && (
        <div className="space-y-3">
          {inquiries.length === 0 ? (
            <p className="text-sm text-muted">No inquiries yet.</p>
          ) : (
            inquiries.map((inq) => (
              <div key={inq.id} className="card p-4">
                <p className="font-bold text-navy">{inq.full_name} · {inq.email}</p>
                <p className="text-xs text-muted capitalize">{inq.status} · {new Date(inq.created_at).toLocaleString()}</p>
                <p className="mt-2 text-sm text-charcoal/65">{inq.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "bookings" && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-sm text-muted">No booking requests assigned yet.</p>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="card p-4">
                <p className="font-bold text-navy">{(b as { title?: string }).title ?? (b as { service_name?: string }).service_name ?? "Booking request"}</p>
                <p className="text-sm text-muted capitalize">{(b as { status: string }).status} · {new Date((b as { created_at: string }).created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

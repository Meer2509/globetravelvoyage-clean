"use client";

import { PropertyInquiryForm } from "@/components/properties/PropertyInquiryForm";

export function PropertyInquiryModal({
  open,
  onClose,
  property,
}: {
  open: boolean;
  onClose: () => void;
  property: { id: string; title: string } | null;
}) {
  if (!open || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-premium)] max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-navy">Property inquiry</h2>
          <button type="button" onClick={onClose} className="text-charcoal/40 hover:text-navy text-xl" aria-label="Close">
            ×
          </button>
        </div>
        <PropertyInquiryForm
          propertyId={property.id}
          propertyTitle={property.title}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
}

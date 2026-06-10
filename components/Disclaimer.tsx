import { Icon } from "./Icon";

export function Disclaimer({
  children,
  variant = "default",
}: {
  children?: React.ReactNode;
  variant?: "default" | "compact" | "inline";
}) {
  const text = children ?? (
    <>
      Globe Travel Voyage is an independent travel marketplace. We are{" "}
      <strong className="font-semibold">not</strong> a government agency, embassy,
      immigration lawyer, airline, cruise company, real estate broker, or official
      visa authority. We do not guarantee visa approval, legal outcomes, or ticket
      prices. All information is for guidance only.
    </>
  );

  if (variant === "inline") {
    return (
      <p className="text-xs leading-relaxed text-navy/50">
        <span className="font-semibold text-navy/70">Disclaimer:</span> {text}
      </p>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/5 ${
        variant === "compact" ? "p-3" : "p-4"
      }`}
    >
      <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
      <p className="text-xs leading-relaxed text-navy/70">{text}</p>
    </div>
  );
}

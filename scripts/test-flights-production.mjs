/**
 * Smoke-test production /api/flights/search → Duffel.
 * Usage: node scripts/test-flights-production.mjs [baseUrl]
 */

const base = (process.argv[2] ?? "https://www.globetravelvoyage.com").replace(/\/$/, "");

const body = {
  origin: "Dubai (DXB)",
  destination: "Karachi (KHI)",
  departureDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  passengers: 1,
  cabinClass: "economy",
};

console.log(`POST ${base}/api/flights/search`);
console.log("body:", body);

const res = await fetch(`${base}/api/flights/search`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const data = await res.json();
console.log("status:", res.status);
console.log("ok:", data.ok);
console.log("source:", data.source ?? "(none)");
console.log("flights:", Array.isArray(data.flights) ? data.flights.length : 0);
console.log("message:", data.message ?? "(none)");

if (data.ok && data.source === "duffel" && data.flights?.length > 0) {
  const first = data.flights[0];
  console.log("sample offer:", {
    airline: first.airline,
    price: first.price,
    currency: first.currency,
  });
  process.exit(0);
}

if (!data.ok && data.message === "Flight quote available upon request.") {
  console.log("Duffel path reached but no live offers (token missing or no availability).");
  process.exit(0);
}

console.error("Unexpected response — verify DUFFEL_ACCESS_TOKEN and route handler.");
process.exit(1);

const base = process.argv[2] ?? "https://www.globetravelvoyage.com";

async function post(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

const chat = await post("/api/ai", {
  prompt: "What visa does a Pakistani citizen need for tourism in the USA? One sentence.",
  json: false,
});

const visaJson = await post("/api/ai", {
  prompt:
    "Analyze visa case. Nationality: Pakistani. Residence: UAE. Destination: USA. Purpose: tourism. Return JSON only with keys visaType and disclaimer.",
  json: true,
});

console.log(JSON.stringify({ base, chat, visaJson }, null, 2));

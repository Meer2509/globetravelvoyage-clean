export interface AuthorizationFormInput {
  clientName: string;
  passportNo: string;
  visaType: string;
  expertName: string;
}

export function buildAuthorizationText(input: AuthorizationFormInput): string {
  const clientName = input.clientName.trim() || "[Client Full Name]";
  const passportNo = input.passportNo.trim() || "[Passport No.]";
  const visaType = input.visaType.trim() || "[Visa Type]";
  const expertName = input.expertName.trim() || "Visa Expert";

  return `AUTHORIZATION FORM
Globe Travel Voyage — Visa Preparation Services

I, ${clientName}, holder of passport ${passportNo}, hereby authorize ${expertName} (Visa Expert on Globe Travel Voyage) to assist me with the preparation of my ${visaType} visa application.

I confirm that all information and documents I provide are true, accurate and complete to the best of my knowledge. I understand that the agent provides preparation assistance only and does not guarantee visa approval, which rests solely with the relevant embassy or immigration authority.

I authorize the agent to review, organize and advise on my documents for the purpose of this visa application only.

Client signature & date: ___________________________
Agent (${expertName}) signature & date: ___________________________

Globe Travel Voyage is not an immigration authority, embassy, or law firm. This document is an internal preparation agreement only.`;
}

export function buildAuthorizationHtml(input: AuthorizationFormInput): string {
  const text = buildAuthorizationText(input);
  const paragraphs = text.split("\n\n").map((p) => `<p style="margin:0 0 14px;line-height:1.6;">${p.replace(/\n/g, "<br/>")}</p>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Authorization Form — Globe Travel Voyage</title>
  <style>
    body { font-family: Georgia, serif; color: #081c3a; padding: 40px; max-width: 720px; margin: 0 auto; }
    h1 { text-align: center; font-size: 20px; letter-spacing: 0.08em; text-transform: uppercase; }
    .sub { text-align: center; color: #666; font-size: 12px; margin-bottom: 28px; }
  </style>
</head>
<body>
  <h1>Authorization Form</h1>
  <p class="sub">Globe Travel Voyage — Visa Preparation Services</p>
  ${paragraphs}
</body>
</html>`;
}

export async function copyAuthorizationText(input: AuthorizationFormInput): Promise<void> {
  await navigator.clipboard.writeText(buildAuthorizationText(input));
}

export function printAuthorizationPdf(input: AuthorizationFormInput): void {
  const html = buildAuthorizationHtml(input);
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) throw new Error("Pop-up blocked. Allow pop-ups to download or print the form.");
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

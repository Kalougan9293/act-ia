import { formatDate } from "@/lib/admin/format";
import { PLAN_LABELS, type Structure } from "@/lib/admin/types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(amount: number) {
  if (!amount) return "Sur devis";
  return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function invoiceHtml(structure: Structure) {
  const billing = structure.billing;
  const issued = new Date().toISOString().slice(0, 10);
  const number = `FAC-${issued.replace(/-/g, "")}-${structure.id.slice(-6).toUpperCase()}`;
  const client = [
    billing.companyName || structure.name,
    billing.address,
    billing.siret ? `SIRET ${billing.siret}` : "",
    billing.billingEmail,
    billing.phone,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(line))
    .join("<br>");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Facture ${escapeHtml(number)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #0f172a; margin: 56px 64px; }
    .emitter { font-size: 14px; line-height: 1.45; }
    .client-wrap { display: flex; justify-content: flex-end; margin-top: 72px; }
    .client { font-size: 14px; line-height: 1.5; text-align: right; }
    .head { text-align: center; margin-top: 64px; }
    h1 { font-size: 28px; margin: 0 0 6px; font-weight: 700; }
    .muted { color: #475569; font-size: 14px; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 120px; font-size: 14px; }
    th, td { text-align: left; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    th { font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: #64748b; }
    td.amount, th.amount { text-align: right; }
    .total { margin-top: 16px; text-align: right; font-size: 18px; }
  </style>
</head>
<body>
  <div class="emitter">
    <strong>FitOps AI</strong><br>
    119 rue Jules Parent<br>
    Rueil-Malmaison (92500)<br>
    contact@lockin-web.online<br>
    SIRET 853 780 906 00063
  </div>
  <div class="client-wrap">
    <div class="client">
      <strong>Client</strong><br>
      ${client || "—"}
    </div>
  </div>
  <div class="head">
    <h1>Facture</h1>
    <p class="muted">${escapeHtml(number)} · ${escapeHtml(formatDate(issued))}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Prestation</th>
        <th class="amount">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          Abonnement ConformAI · ${escapeHtml(PLAN_LABELS[billing.plan])}<br>
          <span class="muted">${billing.seats} accès · prochaine échéance ${escapeHtml(formatDate(billing.nextInvoiceAt))}</span>
        </td>
        <td class="amount">${escapeHtml(money(billing.priceMonthlyEur))}</td>
      </tr>
    </tbody>
  </table>
  <p class="total">Total ${escapeHtml(money(billing.priceMonthlyEur))}</p>
</body>
</html>`;
}

export function openStructureInvoice(structure: Structure) {
  const page = window.open("", "_blank", "width=820,height=900");
  if (!page) return false;
  page.document.open();
  page.document.write(invoiceHtml(structure));
  page.document.close();
  page.focus();
  window.setTimeout(() => page.print(), 200);
  return true;
}

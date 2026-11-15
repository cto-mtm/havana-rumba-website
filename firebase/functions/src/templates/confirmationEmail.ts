import type { FormConfig } from "../models.js";
import { escapeHtml } from "../helpers/escapeHtml.js";

const COMPANY_NAME = "Havana Rumba";
const COMPANY_ADDRESS = "Louisville, Kentucky";

/**
 * User-facing confirmation sent to the submitter. Inline styles only.
 *
 * Deliberately contains NO submitted content (not even the name): the
 * recipient address is unverified, so echoing user input would let anyone
 * use our Gmail account to deliver arbitrary text to arbitrary inboxes.
 */
export function buildConfirmationEmail(config: FormConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(config.confirmationSubject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="height:6px;background:#dc2626;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:40px 32px 8px;text-align:center;">
              <div style="font-size:24px;font-weight:700;color:#18181b;">${escapeHtml(config.confirmationSubject)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;font-size:15px;line-height:1.6;color:#3f3f46;text-align:center;">
              Thanks for reaching out to ${escapeHtml(COMPANY_NAME)}. We received your submission
              and will get back to you as soon as possible.
              <br><br>
              Gracias por escribirnos. Recibimos tu mensaje y te responderemos lo antes posible.
              <br><br>
              <span style="font-size:13px;color:#71717a;">If you didn’t submit a form on our website, you can ignore this email.</span>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#a1a1aa;text-align:center;">
              ${escapeHtml(COMPANY_NAME)} · ${escapeHtml(COMPANY_ADDRESS)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

import type { FormConfig } from "../models.js";
import { escapeHtml } from "../helpers/escapeHtml.js";

const COMPANY_NAME = "Havana Rumba";
const COMPANY_ADDRESS = "REPLACE_ME street address, city";

function humanize(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** Internal notification sent to `config.notifyEmail`. Inline styles only. */
export function buildNotificationEmail(config: FormConfig, data: Record<string, unknown>): string {
  const fields = [...config.requiredFields, ...config.optionalFields];
  const extra = Object.keys(data).filter((k) => !fields.includes(k));

  const rows = [...fields, ...extra]
    .filter((key) => data[key] !== undefined && data[key] !== "")
    .map((key) => `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;font-size:13px;font-weight:600;color:#52525b;vertical-align:top;width:35%;">${escapeHtml(humanize(key))}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#18181b;white-space:pre-wrap;">${escapeHtml(data[key])}</td>
            </tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(config.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#18181b;padding:24px 32px;color:#ffffff;font-size:20px;font-weight:700;">
              ${escapeHtml(config.subject)}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px;font-size:14px;color:#52525b;">
              A new submission arrived from the website:
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}
              </table>
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

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions/v2";
import { ZodError } from "zod";

import formConfigs from "./models.js";
import { createTransporter, formatFrom } from "./helpers/mailer.js";
import { verifyRecaptcha } from "./helpers/recaptcha.js";
import { buildNotificationEmail } from "./templates/notificationEmail.js";
import { buildConfirmationEmail } from "./templates/confirmationEmail.js";

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const GMAIL_SENDER = defineSecret("GMAIL_SENDER");
const RECAPTCHA_SECRET_KEY = defineSecret("RECAPTCHA_SECRET_KEY");

// Origins allowed to POST forms: the live domain (www is canonical; the apex
// redirects to it, but list both). No localhost entry is needed: the Functions
// emulator forces permissive CORS (firebase-functions "enableCors" debug
// feature), so local dev works on any port without hard-coding one here.
const ALLOWED_ORIGINS = ["https://www.havanarumbaonline.com", "https://havanarumbaonline.com"];

/**
 * Loggable summary of a mail error. Never log `message`: SMTP errors quote
 * the recipient address (and sometimes the envelope), which is personal data.
 */
function mailErrorInfo(err: unknown): Record<string, unknown> {
  const e = err as { code?: unknown; responseCode?: unknown; command?: unknown } | null;
  return { code: e?.code, responseCode: e?.responseCode, command: e?.command };
}

interface SubmitBody {
  formType?: string;
  data?: Record<string, unknown>;
  recaptchaToken?: string;
}

export const submitForm = onRequest(
  {
    region: "us-central1",
    maxInstances: 10,
    cors: ALLOWED_ORIGINS,
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD, GMAIL_SENDER, RECAPTCHA_SECRET_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    const { formType, data, recaptchaToken } = (req.body ?? {}) as SubmitBody;

    // 1. Resolve form config
    // Own-property check: plain-object lookup would accept "constructor",
    // "toString", … and crash on config.schema below.
    const config = typeof formType === "string" && Object.hasOwn(formConfigs, formType)
      ? formConfigs[formType]
      : undefined;
    if (!formType || !config) {
      res.status(400).json({
        success: false,
        error: `Unknown formType "${formType ?? ""}". Valid types: ${Object.keys(formConfigs).join(", ")}`,
      });
      return;
    }

    // 2. reCAPTCHA (bypassed in the emulator)
    const captcha = await verifyRecaptcha(recaptchaToken, RECAPTCHA_SECRET_KEY.value());
    if (!captcha.success) {
      logger.warn("reCAPTCHA rejected", { formType, score: captcha.score, error: captcha.error });
      res.status(403).json({ success: false, error: "reCAPTCHA verification failed" });
      return;
    }

    // 3. Validate payload
    let parsed: Record<string, unknown>;
    try {
      parsed = config.schema.parse(data ?? {}) as Record<string, unknown>;
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, error: "Validation failed", details: err.flatten() });
        return;
      }
      throw err;
    }

    // 4. Send emails
    const transporter = createTransporter(GMAIL_USER.value(), GMAIL_APP_PASSWORD.value());
    const from = formatFrom(GMAIL_SENDER.value());
    const name = typeof parsed.name === "string" ? parsed.name : "Unknown";
    const email = typeof parsed.email === "string" ? parsed.email : undefined;

    // 4a. Internal notification — this is the submission. If it fails, the
    //     user must retry, so surface a 500.
    try {
      await transporter.sendMail({
        from,
        to: config.notifyEmail,
        replyTo: email,
        subject: `${config.subject} — ${name.replace(/[\r\n]/g, "").slice(0, 120)}`,
        html: buildNotificationEmail(config, parsed),
      });
    } catch (err) {
      logger.error("Failed to send notification email", { formType, ...mailErrorInfo(err) });
      res.status(500).json({ success: false, error: "Failed to send message" });
      return;
    }

    // 4b. Confirmation — best effort. The submission already reached staff,
    //     so a bad/bouncing address must not turn into an error + resubmit.
    let confirmed = false;
    if (email) {
      try {
        await transporter.sendMail({
          from,
          to: email,
          subject: config.confirmationSubject,
          html: buildConfirmationEmail(config),
        });
        confirmed = true;
      } catch (err) {
        logger.warn("Confirmation email failed (submission was delivered)", { formType, ...mailErrorInfo(err) });
      }
    }

    logger.info("Form submitted", { formType, confirmed, score: captcha.score });
    res.status(200).json({ success: true });
  },
);

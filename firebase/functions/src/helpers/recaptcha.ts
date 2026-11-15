const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE = 0.5;

export interface RecaptchaResult {
  success: boolean;
  score?: number;
  error?: string;
}

interface SiteVerifyResponse {
  "success": boolean;
  "score"?: number;
  "action"?: string;
  "error-codes"?: string[];
}

/**
 * Verify a reCAPTCHA v3 token. Always passes inside the Functions emulator
 * so local testing doesn't need a real token.
 */
export async function verifyRecaptcha(
  token: string | undefined,
  secret: string,
): Promise<RecaptchaResult> {
  if (process.env.FUNCTIONS_EMULATOR === "true") {
    return { success: true, score: 1.0 };
  }

  if (!token) {
    return { success: false, error: "Missing reCAPTCHA token" };
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const body = (await res.json()) as SiteVerifyResponse;

    if (!body.success) {
      return { success: false, error: (body["error-codes"] ?? ["verification failed"]).join(", ") };
    }

    const score = body.score ?? 0;
    if (score < MIN_SCORE) {
      return { success: false, score, error: `Score ${score} below threshold ${MIN_SCORE}` };
    }

    return { success: true, score };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "reCAPTCHA request failed" };
  }
}

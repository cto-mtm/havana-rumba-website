export interface SubmitFormResult {
  success: boolean
  error?: string
}

const FALLBACK_URL = 'https://us-central1-REPLACE_ME.cloudfunctions.net/submitForm'

// ── reCAPTCHA v3 ────────────────────────────────────────────────
// The Cloud Function rejects any submission without a valid token (outside
// the emulator), so every form gets one automatically here. The Google
// script is loaded lazily on the first submit — no cost on page load.

interface Grecaptcha {
  ready: (cb: () => void) => void
  execute: (siteKey: string, opts: { action: string }) => Promise<string>
}

declare global {
  interface Window { grecaptcha?: Grecaptcha }
}

let recaptchaLoader: Promise<void> | null = null

function loadRecaptcha(siteKey: string): Promise<void> {
  if (window.grecaptcha?.execute) return Promise.resolve()
  recaptchaLoader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      recaptchaLoader = null
      reject(new Error('reCAPTCHA failed to load'))
    }
    document.head.appendChild(script)
  })
  return recaptchaLoader
}

async function getRecaptchaToken(siteKey: string, action: string): Promise<string | undefined> {
  if (!siteKey || import.meta.server) return undefined
  await loadRecaptcha(siteKey)
  const g = window.grecaptcha
  if (!g) return undefined
  await new Promise<void>(resolve => g.ready(resolve))
  // Actions may only contain letters, digits, "_" and "/"
  return g.execute(siteKey, { action: action.replace(/[^\w/]/g, '_') })
}

/**
 * POST a form to the `submitForm` Cloud Function.
 * Fetches a reCAPTCHA v3 token automatically unless one is passed in.
 * Never throws — network and server errors come back as `{ success: false, error }`.
 *
 * @example
 *   const { success, error } = await useSubmitForm('contact', { name, email, message })
 */
export async function useSubmitForm(
  formType: string,
  data: Record<string, unknown>,
  recaptchaToken?: string
): Promise<SubmitFormResult> {
  // Read config before any await (Nuxt context is lost after the first await).
  const { submitFormUrl, recaptchaSiteKey } = useRuntimeConfig().public as {
    submitFormUrl?: string
    recaptchaSiteKey?: string
  }
  const url = submitFormUrl && submitFormUrl !== 'REPLACE_ME' ? submitFormUrl : FALLBACK_URL

  try {
    const token = recaptchaToken ?? await getRecaptchaToken(recaptchaSiteKey ?? '', formType)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, data, recaptchaToken: token })
    })

    const body = await res.json().catch(() => ({})) as { success?: boolean, error?: string }

    if (!res.ok || !body.success) {
      return { success: false, error: body.error ?? `Request failed (${res.status})` }
    }

    return { success: true }
  }
  catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}

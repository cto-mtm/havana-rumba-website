// Shared form machinery for every site form (contact, careers, …):
// validation state, status/live-region message, focus-first-invalid,
// aria-describedby wiring, and the WebMCP agent bridge (submit events
// fired by in-browser AI agents carry `agentInvoked` + `respondWith`).
//
// i18n contract — each form's namespace needs:
//   <ns>.form.invalid | <ns>.form.success | <ns>.form.error
// DOM contract — controls use id `${idPrefix}-${field}`, hints
// `${idPrefix}-${field}-hint`, errors `${idPrefix}-${field}-error`.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface AgentSubmitEvent extends SubmitEvent {
  agentInvoked?: boolean
  respondWith?: (result: Promise<unknown>) => void
}

export interface FormSubmissionOptions<F extends string> {
  formType: string
  /** i18n namespace, e.g. 'PageContact' */
  i18nNs: string
  /** DOM id prefix, e.g. 'contact' */
  idPrefix: string
  /** Returns an error message per invalid field (in display order) */
  validate: () => Partial<Record<F, string>>
  /** Builds the payload sent to the Cloud Function */
  payload: () => Record<string, unknown>
  /** Clears the form after a successful send */
  reset: () => void
}

export function useFormSubmission<F extends string>(opts: FormSubmissionOptions<F>) {
  const { t } = useI18n()

  const errors = reactive<Partial<Record<F, string>>>({}) as Partial<Record<F, string>>
  const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
  const statusMessage = ref('')

  function describedBy(field: F, hasHint = false): string | undefined {
    const ids = [
      hasHint ? `${opts.idPrefix}-${field}-hint` : null,
      errors[field] ? `${opts.idPrefix}-${field}-error` : null
    ].filter(Boolean)
    return ids.length ? ids.join(' ') : undefined
  }

  async function send(): Promise<string> {
    // Replace (not merge) the error map so fixed fields clear
    const found = opts.validate()
    for (const key of Object.keys(errors) as F[]) delete errors[key]
    Object.assign(errors, found)

    const firstInvalid = (Object.keys(found) as F[]).find(k => found[k])
    if (firstInvalid) {
      status.value = 'error'
      statusMessage.value = t(`${opts.i18nNs}.form.invalid`)
      document.getElementById(`${opts.idPrefix}-${firstInvalid}`)?.focus()
      return statusMessage.value
    }

    status.value = 'sending'
    const { success } = await useSubmitForm(opts.formType, opts.payload())

    status.value = success ? 'success' : 'error'
    statusMessage.value = t(`${opts.i18nNs}.form.${success ? 'success' : 'error'}`)
    if (success) opts.reset()
    return statusMessage.value
  }

  function onSubmit(event: Event) {
    if (status.value === 'sending') return
    const e = event as AgentSubmitEvent
    const result = send()
    if (e.agentInvoked && typeof e.respondWith === 'function') e.respondWith(result)
  }

  return { errors, status, statusMessage, describedBy, onSubmit }
}

/** Shared control styling so every form looks identical */
export const FORM_INPUT_CLASS = 'block w-full rounded-xl border border-default bg-default px-4 py-3 text-highlighted shadow-soft transition-all placeholder:text-dimmed focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-error aria-[invalid=true]:ring-error/15'
export const FORM_LABEL_CLASS = 'mb-1.5 block text-sm font-semibold text-highlighted'

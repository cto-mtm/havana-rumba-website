<script setup lang="ts">
// Employment application → submitForm Cloud Function (formType "careers").
// Same accessibility + WebMCP patterns as contact-us.vue (shared logic in
// composables/useFormSubmission.ts).
// Deliberately NOT collected (the old form asked for them): date of birth and
// gender — not needed to screen applicants and a discrimination-claim risk.
import type { DayOfWeek } from '~/utils/locations'

definePageMeta({ heroOverlay: true })

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t('PageCareers.seoTitle'),
  description: () => t('PageCareers.seoDescription'),
  ogImage: '/images/ambience/chef.webp'
})

const JOBS_EMAIL = 'jobs@havanarumbaonline.com'
const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SHIFTS = ['morning', 'night'] as const

type Field = 'firstName' | 'lastName' | 'email' | 'phone' | 'position' | 'location' | 'history'
const REQUIRED: Field[] = ['firstName', 'lastName', 'email', 'phone', 'position']

const form = reactive<Record<Field, string>>({
  firstName: '', lastName: '', email: '', phone: '', position: '', location: '', history: ''
})
const availability = ref<string[]>([])

const { errors, status, statusMessage, describedBy, onSubmit } = useFormSubmission<Field>({
  formType: 'careers',
  i18nNs: 'PageCareers',
  idPrefix: 'careers',
  validate: () => {
    const out: Partial<Record<Field, string>> = {}
    for (const f of REQUIRED) {
      const v = form[f].trim()
      // Phone rule mirrors the server schema (models.ts): at least 7 digits
      const bad = f === 'email'
        ? !EMAIL_RE.test(v)
        : f === 'phone'
          ? v.replace(/\D/g, '').length < 7
          : !v
      if (bad) out[f] = t(`PageCareers.errors.${f}`)
    }
    return out
  },
  payload: () => ({
    name: `${form.firstName.trim()} ${form.lastName.trim()}`,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    position: form.position.trim(),
    location: form.location || undefined,
    availability: availability.value.length ? availability.value.join(', ') : undefined,
    history: form.history.trim() || undefined
  }),
  reset: () => {
    Object.assign(form, { firstName: '', lastName: '', email: '', phone: '', position: '', location: '', history: '' })
    availability.value = []
  }
})

const inputClass = FORM_INPUT_CLASS
const labelClass = FORM_LABEL_CLASS
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('PageCareers.eyebrow')"
      :title="t('PageCareers.title')"
      image-id="chef"
    >
      <i18n-t keypath="PageCareers.intro" tag="p" class="reveal reveal-delay-1 mt-5 max-w-2xl text-lg text-white/85">
        <template #email>
          <a :href="`mailto:${JOBS_EMAIL}`" class="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">{{ JOBS_EMAIL }}</a>
        </template>
      </i18n-t>
    </PageHero>

    <section class="section-overlap px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <form
          class="reveal frame space-y-8 p-6 sm:p-10"
          method="post"
          novalidate
          toolname="apply_for_job"
          tooldescription="Submit an employment application to the Havana Rumba / Mojito restaurant group in Louisville. Requires first name, last name, email, phone and desired position; preferred location, weekly shift availability and employment history are optional."
          @submit.prevent="onSubmit"
        >
          <fieldset class="grid gap-6 sm:grid-cols-2" :disabled="status === 'sending'">
            <legend class="mb-2 font-display text-2xl font-semibold text-highlighted sm:col-span-2">
              {{ t('PageCareers.form.legend') }}
            </legend>

            <!-- Text inputs -->
            <div v-for="f in (['firstName', 'lastName', 'email', 'phone'] as const)" :key="f">
              <label :for="`careers-${f}`" :class="labelClass">
                {{ t(`PageCareers.form.${f}`) }}
                <span class="text-error" aria-hidden="true">*</span>
                <span class="sr-only">({{ t('PageCareers.form.required') }})</span>
              </label>
              <input
                :id="`careers-${f}`"
                v-model="form[f]"
                :name="f"
                :type="f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'"
                :inputmode="f === 'email' ? 'email' : f === 'phone' ? 'tel' : undefined"
                :autocomplete="{ firstName: 'given-name', lastName: 'family-name', email: 'email', phone: 'tel' }[f]"
                required
                :aria-invalid="!!errors[f]"
                :aria-describedby="describedBy(f, f === 'email')"
                :toolparamdescription="{ firstName: 'Applicant first name.', lastName: 'Applicant last name.', email: 'Applicant email address for follow-up.', phone: 'Applicant phone number.' }[f]"
                :class="inputClass"
              >
              <p v-if="f === 'email'" :id="`careers-${f}-hint`" class="mt-1.5 text-xs text-muted">
                {{ t('PageCareers.form.emailHint') }}
              </p>
              <p v-if="errors[f]" :id="`careers-${f}-error`" class="mt-1 flex items-center gap-1 text-sm text-error">
                <UIcon name="i-lucide-circle-alert" class="size-4" aria-hidden="true" />
                {{ errors[f] }}
              </p>
            </div>

            <!-- Position -->
            <div>
              <label for="careers-position" :class="labelClass">
                {{ t('PageCareers.form.position') }}
                <span class="text-error" aria-hidden="true">*</span>
                <span class="sr-only">({{ t('PageCareers.form.required') }})</span>
              </label>
              <input
                id="careers-position"
                v-model="form.position"
                name="position"
                type="text"
                required
                :aria-invalid="!!errors.position"
                :aria-describedby="describedBy('position', true)"
                toolparamdescription="Job the applicant wants, e.g. server, host, line cook, bartender."
                :class="inputClass"
              >
              <p id="careers-position-hint" class="mt-1.5 text-xs text-muted">
                {{ t('PageCareers.form.positionHint') }}
              </p>
              <p v-if="errors.position" id="careers-position-error" class="mt-1 flex items-center gap-1 text-sm text-error">
                <UIcon name="i-lucide-circle-alert" class="size-4" aria-hidden="true" />
                {{ errors.position }}
              </p>
            </div>

            <!-- Location -->
            <div>
              <label for="careers-location" :class="labelClass">{{ t('PageCareers.form.location') }}</label>
              <select
                id="careers-location"
                v-model="form.location"
                name="location"
                toolparamdescription="Preferred restaurant location, or empty for any location."
                :class="inputClass"
              >
                <option value="">
                  {{ t('PageCareers.form.anyLocation') }}
                </option>
                <option v-for="l in LOCATIONS" :key="l.slug" :value="`${l.brand} (${l.area})`">
                  {{ l.brand }} — {{ l.area }}
                </option>
              </select>
            </div>

            <!-- Availability -->
            <fieldset class="sm:col-span-2" aria-describedby="careers-availability-hint">
              <legend :class="labelClass">
                {{ t('PageCareers.form.availability') }}
              </legend>
              <p id="careers-availability-hint" class="mb-3 text-xs text-muted">
                {{ t('PageCareers.form.availabilityHint') }}
              </p>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <template v-for="day in DAYS" :key="day">
                  <label
                    v-for="shift in SHIFTS"
                    :key="`${day}-${shift}`"
                    class="flex cursor-pointer items-center gap-2 border-2 border-default px-3 py-2 font-condensed text-base font-semibold transition-colors has-[:checked]:border-inverted has-[:checked]:bg-primary/10"
                  >
                    <input
                      v-model="availability"
                      type="checkbox"
                      name="availability"
                      :value="`${day} ${shift}`"
                      :toolparamdescription="`Check if the applicant can work ${day} ${shift} shifts.`"
                      class="size-4 accent-[var(--ui-primary)]"
                    >
                    {{ formatDay(day, locale, 'short') }} · {{ t(`PageCareers.form.${shift}`) }}
                  </label>
                </template>
              </div>
            </fieldset>

            <!-- History -->
            <div class="sm:col-span-2">
              <label for="careers-history" :class="labelClass">{{ t('PageCareers.form.history') }}</label>
              <textarea
                id="careers-history"
                v-model="form.history"
                name="history"
                rows="5"
                aria-describedby="careers-history-hint"
                toolparamdescription="Optional summary of previous jobs, roles and durations."
                :class="[inputClass, 'field-sizing-content min-h-32 resize-y']"
              />
              <p id="careers-history-hint" class="mt-1.5 text-xs text-muted">
                {{ t('PageCareers.form.historyHint') }}
              </p>
            </div>
          </fieldset>

          <button
            type="submit"
            class="btn-menu frame-dark-sm group w-full py-3.5 text-base disabled:pointer-events-none disabled:opacity-60"
            :disabled="status === 'sending'"
          >
            <UIcon
              :name="status === 'sending' ? 'i-lucide-loader-circle' : 'i-lucide-briefcase'"
              class="size-5 transition-transform duration-300 group-hover:-rotate-12"
              :class="{ 'animate-spin': status === 'sending' }"
              aria-hidden="true"
            />
            {{ status === 'sending' ? t('PageCareers.form.sending') : t('PageCareers.form.submit') }}
          </button>

          <p
            role="status"
            aria-live="polite"
            class="min-h-6 text-center text-sm font-medium"
            :class="status === 'success' ? 'text-success' : 'text-error'"
          >
            {{ status === 'success' || status === 'error' ? statusMessage : '' }}
          </p>

          <p class="text-center text-xs text-dimmed">
            {{ t('PageCareers.eeo') }}
          </p>
        </form>
      </div>
    </section>
  </div>
</template>

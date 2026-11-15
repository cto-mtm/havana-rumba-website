<script setup lang="ts">
// Contact form
// - Semantic, accessible markup per Chrome Modern Web Guidance:
//   real <form>, explicit <label for>, aria-describedby for hints + errors,
//   aria-invalid on bad fields, live region for the result.
// - WebMCP Declarative API: `toolname` / `tooldescription` on the <form> and
//   `toolparamdescription` on each control expose this form as a structured
//   tool to in-browser AI agents. Submit/validation/agent plumbing lives in
//   composables/useFormSubmission.ts.
definePageMeta({ heroOverlay: true })

const { t } = useI18n()

useSeoMeta({
  title: () => t('PageContact.seoTitle'),
  description: () => t('PageContact.seoDescription'),
  ogImage: '/images/ambience/bar.webp'
})

type Field = 'name' | 'email' | 'phone' | 'message'

const form = reactive<Record<Field, string>>({ name: '', email: '', phone: '', message: '' })

const { errors, status, statusMessage, describedBy, onSubmit } = useFormSubmission<Field>({
  formType: 'contact',
  i18nNs: 'PageContact',
  idPrefix: 'contact',
  validate: () => ({
    ...(!form.name.trim() && { name: t('PageContact.errors.name') }),
    ...(!EMAIL_RE.test(form.email.trim()) && { email: t('PageContact.errors.email') }),
    ...(!form.message.trim() && { message: t('PageContact.errors.message') })
  }),
  payload: () => ({
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || undefined,
    message: form.message.trim()
  }),
  reset: () => Object.assign(form, { name: '', email: '', phone: '', message: '' })
})

const inputClass = FORM_INPUT_CLASS
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('PageContact.eyebrow')"
      :title="t('PageContact.title')"
      :intro="t('PageContact.intro')"
      image-id="bar"
    />

    <section class="section-overlap px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl">
      <form
        class="reveal frame space-y-6 p-6 sm:p-10"
        method="post"
        novalidate
        toolname="send_contact_message"
        tooldescription="Send a message to the Havana Rumba / Mojito restaurant group in Louisville. Requires the sender's name, a valid email address and a message; phone number is optional."
        @submit.prevent="onSubmit"
      >
        <fieldset class="space-y-6" :disabled="status === 'sending'">
          <legend class="sr-only">
            {{ t('PageContact.form.legend') }}
          </legend>

          <!-- Name -->
          <div>
            <label for="contact-name" :class="FORM_LABEL_CLASS">
              {{ t('PageContact.form.name') }}
              <span class="text-error" aria-hidden="true">*</span>
              <span class="sr-only">({{ t('PageContact.form.required') }})</span>
            </label>
            <input
              id="contact-name"
              v-model="form.name"
              name="name"
              type="text"
              autocomplete="name"
              required
              :aria-invalid="!!errors.name"
              :aria-describedby="describedBy('name', true)"
              toolparamdescription="Full name of the person sending the message."
              :class="inputClass"
            >
            <p id="contact-name-hint" class="mt-1.5 text-xs text-muted">
              {{ t('PageContact.form.nameHint') }}
            </p>
            <p v-if="errors.name" id="contact-name-error" class="mt-1 flex items-center gap-1 text-sm text-error">
              <UIcon name="i-lucide-circle-alert" class="size-4" aria-hidden="true" />
              {{ errors.name }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <label for="contact-email" :class="FORM_LABEL_CLASS">
              {{ t('PageContact.form.email') }}
              <span class="text-error" aria-hidden="true">*</span>
              <span class="sr-only">({{ t('PageContact.form.required') }})</span>
            </label>
            <input
              id="contact-email"
              v-model="form.email"
              name="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              required
              :aria-invalid="!!errors.email"
              :aria-describedby="describedBy('email', true)"
              toolparamdescription="Email address where the reply should be sent."
              :class="inputClass"
            >
            <p id="contact-email-hint" class="mt-1.5 text-xs text-muted">
              {{ t('PageContact.form.emailHint') }}
            </p>
            <p v-if="errors.email" id="contact-email-error" class="mt-1 flex items-center gap-1 text-sm text-error">
              <UIcon name="i-lucide-circle-alert" class="size-4" aria-hidden="true" />
              {{ errors.email }}
            </p>
          </div>

          <!-- Phone (optional) -->
          <div>
            <label for="contact-phone" :class="FORM_LABEL_CLASS">
              {{ t('PageContact.form.phone') }}
            </label>
            <input
              id="contact-phone"
              v-model="form.phone"
              name="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              :aria-describedby="describedBy('phone', true)"
              toolparamdescription="Optional phone number, including country code if outside the US."
              :class="inputClass"
            >
            <p id="contact-phone-hint" class="mt-1.5 text-xs text-muted">
              {{ t('PageContact.form.phoneHint') }}
            </p>
          </div>

          <!-- Message -->
          <div>
            <label for="contact-message" :class="FORM_LABEL_CLASS">
              {{ t('PageContact.form.message') }}
              <span class="text-error" aria-hidden="true">*</span>
              <span class="sr-only">({{ t('PageContact.form.required') }})</span>
            </label>
            <textarea
              id="contact-message"
              v-model="form.message"
              name="message"
              rows="6"
              required
              :aria-invalid="!!errors.message"
              :aria-describedby="describedBy('message', true)"
              toolparamdescription="The message or question for the team."
              :class="[inputClass, 'field-sizing-content min-h-36 resize-y']"
            />
            <p id="contact-message-hint" class="mt-1.5 text-xs text-muted">
              {{ t('PageContact.form.messageHint') }}
            </p>
            <p v-if="errors.message" id="contact-message-error" class="mt-1 flex items-center gap-1 text-sm text-error">
              <UIcon name="i-lucide-circle-alert" class="size-4" aria-hidden="true" />
              {{ errors.message }}
            </p>
          </div>
        </fieldset>

        <button
          type="submit"
          class="btn-menu frame-dark-sm group w-full py-3.5 text-base disabled:pointer-events-none disabled:opacity-60"
          :disabled="status === 'sending'"
        >
          <UIcon
            :name="status === 'sending' ? 'i-lucide-loader-circle' : 'i-lucide-send'"
            class="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-rotate-12"
            :class="{ 'animate-spin': status === 'sending' }"
            aria-hidden="true"
          />
          {{ status === 'sending' ? t('PageContact.form.sending') : t('PageContact.form.submit') }}
        </button>

        <p
          role="status"
          aria-live="polite"
          class="min-h-6 text-center text-sm font-medium"
          :class="status === 'success' ? 'text-success' : 'text-error'"
        >
          {{ status === 'success' || status === 'error' ? statusMessage : '' }}
        </p>
      </form>
    </div>
  </section>
  </div>
</template>

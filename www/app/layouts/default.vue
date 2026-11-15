<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-default text-default">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-inverted"
    >
      {{ t('AppHeader.skipToContent') }}
    </a>

    <SiteHeader />

    <main id="main" class="flex-1">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>

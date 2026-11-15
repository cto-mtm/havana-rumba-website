<script setup lang="ts">
// Renders text with the restaurants' own lettering on their names:
//   "Havana" / "Habana"  → .brand-havana (Havana Rumba logo caps)
//   "Mojito" / "Mojitos" → .brand-mojito (Mojito logo lettering)
// Everything else keeps the surrounding font. Use it wherever copy can
// mention a brand: <h2><BrandText :text="t('…')" /></h2>
// Renders inline spans only, so it is safe inside any text element.
const props = defineProps<{ text: string }>()

const BRAND_WORD = /\b(Havana|Habana|Mojitos?)\b/gi

const parts = computed(() => {
  const out: { text: string, brand?: 'havana' | 'mojito' }[] = []
  let last = 0
  for (const m of props.text.matchAll(BRAND_WORD)) {
    if (m.index > last) out.push({ text: props.text.slice(last, m.index) })
    out.push({ text: m[0], brand: /^mojito/i.test(m[0]) ? 'mojito' : 'havana' })
    last = m.index + m[0].length
  }
  if (last < props.text.length) out.push({ text: props.text.slice(last) })
  return out
})
</script>

<template>
  <!-- One line on purpose: no whitespace may sneak in around brand words -->
  <span v-for="(p, i) in parts" :key="i" :class="p.brand ? `brand-${p.brand}` : undefined">{{ p.text }}</span>
</template>

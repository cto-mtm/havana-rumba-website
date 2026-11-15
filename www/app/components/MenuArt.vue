<script setup lang="ts">
// Colour engravings in the printed drink menu's style (generated on Vertex AI,
// pipeline in /art). Registry and sizes: utils/art.ts.
// Decorative by default; pass `label` when the drawing carries meaning.
import { ART, type ArtId } from '~/utils/art'

const props = withDefaults(defineProps<{
  name: ArtId
  label?: string
  eager?: boolean
}>(), { label: '', eager: false })

const art = computed(() => ART[props.name])
</script>

<template>
  <img
    :src="art.src"
    :width="art.w"
    :height="art.h"
    :alt="label"
    :aria-hidden="label ? undefined : 'true'"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    draggable="false"
    class="select-none"
  >
</template>

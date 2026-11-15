<script setup lang="ts">
// The drink menu's title box ("BEERS / CERVEZAS"): espresso fill, notched
// corners, gold double outline and a gold ornament on each end.
// Styling lives in .menu-banner (assets/css/main.css); this only picks the tag.
withDefaults(defineProps<{ as?: string }>(), { as: 'h2' })
</script>

<template>
  <component :is="as" class="menu-banner">
    <slot />
  </component>
</template>

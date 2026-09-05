<script setup>
/**
 * The Iron Scope seal.
 *
 * One traced path, inheriting `currentColor`, so the same file serves the
 * positive lockup (#153A5B on paper) and the knockout (#F3F0E7 on the dark
 * bands). The seal is NEVER tinted to an accent colour — a seal that changes
 * colour reads as decoration; a seal that is only ever ink-or-knockout reads
 * as a stamp.
 *
 * Below ~48px the ring lettering turns to mud, so `crop="glyph"` reframes the
 * viewBox onto the hammer-and-magnifier alone, which stays legible to 24px.
 */
import sealRaw from '@/assets/brand/seal.svg?raw'

const props = defineProps({
  size: { type: Number, default: 40 },
  crop: { type: String, default: 'full' }, // 'full' | 'glyph'
  title: { type: String, default: '' },
})

const VIEWBOX = {
  full: '0 0 451 438',
  glyph: '150 149 150 150',
}

// Swap the viewBox rather than shipping a second file.
const svg = sealRaw.replace(/viewBox="[^"]*"/, `viewBox="${VIEWBOX[props.crop]}"`)
</script>

<template>
  <span
    class="inline-block shrink-0 align-middle"
    :style="{ width: `${size}px`, height: `${size}px`, lineHeight: 0 }"
    :role="title ? 'img' : undefined"
    :aria-label="title || undefined"
    :aria-hidden="title ? undefined : 'true'"
    v-html="svg"
  />
</template>

<style scoped>
span :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

<script setup>
/**
 * Loss-type glyphs used as a faint watermark inside each standard badge.
 *
 * These are ORIGINAL, generic line drawings of the loss category. They are
 * deliberately NOT the IICRC mark or any certification logo: those are
 * trademarks, and displaying one implies an endorsement we are not claiming.
 * Citing a standard by its designation is fair; wearing its badge is not.
 *
 * ── GEOMETRY CONTRACT ───────────────────────────────────────────────────────
 * Every glyph is drawn to fill the SAME optical box: x 12→52, y 12→52 on a
 * 64×64 viewBox, centred on (32, 32).
 *
 * This matters more than it looks. The four badges place their glyph with
 * identical CSS, so any difference in where the artwork sits inside its own
 * viewBox shows up as the set being misaligned — one riding high, another
 * drifting left, a third reading smaller than its neighbours. Identical
 * positioning does not produce alignment unless the drawings agree on where
 * they live. Keep new glyphs inside the same box.
 *
 * S540 gets a cell rather than the biohazard trefoil: the trefoil is a
 * regulated hazard symbol, it reads as alarming, and the subject is
 * decontamination rather than spectacle. It is drawn asymmetric on purpose —
 * an earlier version was radially symmetric with evenly spaced ticks, which is
 * the construction of a ship's wheel.
 */
const props = defineProps({
  kind: { type: String, required: true }, // S500 | S520 | S540 | S700
})

/**
 * A hint of hue, not a full-strength colour. Picked to read against the carbon
 * field at low opacity — a saturated mid-tone washes out to nothing there.
 */
const TONE = {
  S500: '#6BA8D8', // water — blue
  S520: '#F5F1E7', // mold — the cream already used on dark
  S540: '#7FBF9E', // biohazard — green
  S700: '#E2542B', // fire — red
}

const tone = TONE[props.kind] ?? 'currentColor'
</script>

<template>
  <svg
    viewBox="0 0 64 64"
    fill="none"
    :stroke="tone"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- S500 — water: droplet, apex at 12, base at 52 -->
    <g v-if="kind === 'S500'">
      <path d="M32 12c0 0 15 17 15 26a15 15 0 0 1-30 0c0-9 15-26 15-26z" />
      <path d="M23 40a9 9 0 0 0 9 9" />
    </g>

    <!-- S520 — mold: spore cluster spanning the same box -->
    <g v-else-if="kind === 'S520'">
      <circle cx="24" cy="25" r="9" />
      <circle cx="43" cy="21" r="6" />
      <circle cx="38" cy="41" r="10" />
      <circle cx="19" cy="43" r="5" />
    </g>

    <!-- S540 — biohazard: cell membrane, offset nucleus, granules -->
    <g v-else-if="kind === 'S540'">
      <path d="M34 12c11 0 18 8 18 19 0 11-8 21-19 21-11 0-21-8-21-20 0-11 9-20 22-20z" />
      <circle cx="27" cy="35" r="6" />
      <circle cx="41" cy="26" r="2.5" />
      <circle cx="40" cy="42" r="2" />
    </g>

    <!-- S700 — fire: flame, apex at 12, base at 52 -->
    <g v-else-if="kind === 'S700'">
      <path d="M32 12c7 10 15 15 15 25a15 15 0 0 1-30 0c0-10 8-15 15-25z" />
      <path d="M32 32c3 4 6 7 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10z" />
    </g>
  </svg>
</template>

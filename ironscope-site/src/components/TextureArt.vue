<script setup>
import { useId } from 'vue'

/**
 * Original background artwork, drawn rather than photographed.
 *
 * The seal was carrying every watermark on the page, which turned a brand mark
 * into wallpaper — by the fourth crop it reads as a lack of material rather
 * than as texture. The seal now appears once, in the hero; these carry the rest.
 *
 * All of it is drafting line-work, drawn from what this business actually looks
 * at:
 *
 *   section — a wall assembly cut through: layers, insulation hatch, leader
 *             lines out to callout bubbles. What a scope prices, layer by layer.
 *   plan    — a floor-plan fragment: double-line walls, door swings, dimension
 *             ticks. What a scope is written against.
 *   grid    — drafting paper, with a heavier line every fifth division.
 *
 * A "contour" variant (nested irregular loops, meant to read as moisture
 * mapping) was removed: closed concentric shapes read as a target regardless of
 * how irregular the outline is. Straight technical line-work holds up better at
 * watermark opacity anyway — curves mush, rules stay crisp.
 */
defineProps({
  variant: { type: String, default: 'section' }, // section | plan | grid
})

// Scoped so several instances on one page can't collide on the clip id.
const uid = useId()
const bayClip = `bay-${uid}`

// Diagonal insulation hatch, swept across the stud bay and clipped to it.
const HATCH = Array.from({ length: 16 }, (_, i) => 96 + i * 24)
</script>

<template>
  <svg
    viewBox="0 0 400 400"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Wall assembly, cut through -->
    <g v-if="variant === 'section'">
      <defs>
        <clipPath :id="bayClip">
          <rect x="128" y="72" width="72" height="256" />
        </clipPath>
      </defs>

      <!-- material layer boundaries -->
      <path d="M104 72v256M128 72v256M200 72v256M224 72v256M240 72v256" />

      <!-- top and bottom plates -->
      <path d="M104 72h136M104 96h136M104 304h136M104 328h136" />

      <!-- insulation hatch inside the stud bay -->
      <g :clip-path="`url(#${bayClip})`" stroke-width="0.9">
        <path v-for="y in HATCH" :key="y" :d="`M124 ${y}L204 ${y - 84}`" />
      </g>

      <!-- leader lines out to callout bubbles -->
      <path d="M116 140h136M212 196h40M232 252h20" />
      <circle cx="268" cy="140" r="14" />
      <circle cx="268" cy="196" r="14" />
      <circle cx="268" cy="252" r="14" />
    </g>

    <!-- Floor-plan fragment -->
    <g v-else-if="variant === 'plan'">
      <rect x="40" y="52" width="320" height="252" />
      <rect x="49" y="61" width="302" height="234" />
      <path d="M188 61v104M188 205v90M49 165h139M245 165h106" />
      <path d="M245 61v104" />
      <path d="M188 205a40 40 0 0 0-40-40" />
      <path d="M245 116a30 30 0 0 1 30 30" />
      <path d="M40 336h320M40 330v12M360 330v12M200 330v12" />
    </g>

    <!-- Drafting grid -->
    <g v-else-if="variant === 'grid'">
      <path
        v-for="n in 19"
        :key="`v${n}`"
        :d="`M${n * 20} 0V400`"
        :stroke-width="n % 5 === 0 ? 1.6 : 0.7"
      />
      <path
        v-for="n in 19"
        :key="`h${n}`"
        :d="`M0 ${n * 20}H400`"
        :stroke-width="n % 5 === 0 ? 1.6 : 0.7"
      />
    </g>
  </svg>
</template>

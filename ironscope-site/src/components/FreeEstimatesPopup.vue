<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Medallion3D from '@/components/Medallion3D.vue'

/**
 * Port of app/components/FreeEstimatesPopup.js, mounted globally the same
 * way (see App.vue) -- a site-wide promo, not a per-page component. Same
 * 30s delay, same localStorage dismiss key so a visitor who's already
 * closed it doesn't see it again. Uses the real 3D spinning medallion
 * (Medallion3D.vue, three.js), matching the original exactly.
 */
const DISMISS_KEY = 'ironscope_promo_dismissed'
const SHOW_DELAY_MS = 30000

const route = useRoute()
const visible = ref(false)
let timer = null

onMounted(() => {
  if (route.path === '/coming-soon') return
  if (window.localStorage.getItem(DISMISS_KEY)) return
  timer = setTimeout(() => {
    visible.value = true
  }, SHOW_DELAY_MS)
})
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

function dismiss() {
  visible.value = false
  window.localStorage.setItem(DISMISS_KEY, '1')
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 p-4"
    @click="dismiss"
  >
    <div
      class="relative w-full max-w-sm rounded-card border-2 border-rule bg-surface p-8 text-center"
      @click.stop
    >
      <button
        type="button"
        class="absolute top-3 right-3 text-[22px] leading-none text-muted hover:text-ink"
        aria-label="Dismiss"
        @click="dismiss"
      >
        &times;
      </button>
      <div class="flex justify-center">
        <Medallion3D :size="84" :spin-seconds="9" />
      </div>
      <p class="label mt-5 text-rust">Limited-Time Offer</p>
      <p class="display-3 mt-2 text-ink">Claim your 3 free estimates now!</p>
      <p class="mt-3 text-[14px] leading-relaxed text-ink-2">
        Sign up today and your first three Xactimate estimates are on us — no minimum fee.
      </p>
      <RouterLink to="/register" class="btn btn-signal mt-6 w-full" @click="dismiss">
        Sign Up Free
      </RouterLink>
    </div>
  </div>
</template>

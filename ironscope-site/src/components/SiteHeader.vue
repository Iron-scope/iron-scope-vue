<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import SealMark from '@/components/SealMark.vue'

/**
 * `route: true` items are real pages and must render as RouterLink — a plain
 * <a href="/pricing"> would trigger a full document reload. The rest are
 * in-page anchors and stay as <a>.
 */
const nav = [
  { label: 'Scope of Work', to: '/#scope' },
  { label: 'Large Loss', to: '/#large-loss' },
  { label: 'Standards', to: '/#standards' },
  { label: 'Pricing', to: '/pricing', route: true },
]

const route = useRoute()
const open = ref(false)

watch(() => route.fullPath, () => (open.value = false))
watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-hairline bg-page/92 backdrop-blur-[3px]">
    <div class="shell flex h-[76px] items-center justify-between gap-8">
      <RouterLink to="/" class="flex items-center gap-3.5" aria-label="Iron Scope — home">
        <SealMark :size="44" class="text-[color:var(--color-seal-ink)]" />
        <span class="text-[21px] leading-none font-extrabold tracking-[-0.03em] text-ink uppercase" style="font-stretch:108%">
          Iron Scope
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-9 lg:flex" aria-label="Primary">
        <component
          v-for="item in nav"
          :key="item.to"
          :is="item.route ? 'RouterLink' : 'a'"
          v-bind="item.route ? { to: item.to } : { href: item.to }"
          class="text-[15px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
        >
          {{ item.label }}
        </component>
      </nav>

      <div class="hidden items-center gap-6 md:flex">
        <RouterLink to="/login" class="text-[15px] font-medium text-ink-2 hover:text-ink">
          Log in
        </RouterLink>
        <RouterLink to="/register" class="btn btn-signal !py-2.5">Send a file</RouterLink>
      </div>

      <button
        type="button"
        class="-mr-1 inline-flex h-10 w-10 items-center justify-center text-ink md:hidden"
        :aria-expanded="open"
        aria-controls="mobile-nav"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        @click="open = !open"
      >
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path v-if="!open" d="M2 5h16M2 10h16M2 15h16" />
          <path v-else d="M4 4l12 12M16 4L4 16" />
        </svg>
      </button>
    </div>

    <nav
      v-if="open"
      id="mobile-nav"
      class="border-t border-hairline bg-page md:hidden"
      aria-label="Primary"
    >
      <div class="shell flex flex-col py-2">
        <component
          v-for="item in nav"
          :key="item.to"
          :is="item.route ? 'RouterLink' : 'a'"
          v-bind="item.route ? { to: item.to } : { href: item.to }"
          class="border-b border-hairline py-4 text-[17px] font-medium text-ink-2"
          @click="open = false"
        >
          {{ item.label }}
        </component>
        <div class="flex flex-col gap-3 py-5">
          <RouterLink to="/register" class="btn btn-signal">Send a file</RouterLink>
          <RouterLink to="/login" class="btn btn-outline">Log in</RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>

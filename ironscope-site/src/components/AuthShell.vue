<script setup>
/**
 * Split layout shared by log in and register.
 *
 * Left: the form, on cream. Right: a forest field carrying the reason to
 * bother creating an account. Auth pages are where most sites go blank and
 * generic; this one keeps selling.
 */
import SealMark from '@/components/SealMark.vue'

defineProps({
  eyebrow: { type: String, default: 'Account' },
  title: { type: String, required: true },
  lede: { type: String, default: '' },
  asideTitle: { type: String, default: '' },
  asidePoints: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="grid lg:grid-cols-2">
    <!-- Form side -->
    <div class="flex justify-center px-6 py-16 md:px-10 lg:py-24">
      <div class="w-full max-w-[27rem]">
        <p class="label tick text-rust">{{ eyebrow }}</p>
        <h1 class="display-2 mt-8 text-ink">{{ title }}</h1>
        <p v-if="lede" class="mt-5 text-[16px] leading-relaxed text-ink-2">
          {{ lede }}
        </p>

        <div class="mt-10">
          <slot />
        </div>
      </div>
    </div>

    <!-- Reason-to-act side -->
    <aside class="relative overflow-hidden bg-forest px-6 py-16 text-on-dark md:px-10 lg:py-24">
      <div
        class="pointer-events-none absolute -right-32 -bottom-32 opacity-[0.07]"
        aria-hidden="true"
      >
        <SealMark :size="520" class="text-on-dark" />
      </div>

      <div class="relative flex h-full max-w-md flex-col justify-center lg:mx-auto">
        <h2 v-if="asideTitle" class="display-3">{{ asideTitle }}</h2>
        <ul v-if="asidePoints.length" class="mt-8 space-y-5">
          <li v-for="p in asidePoints" :key="p.k" class="border-t border-on-dark-rule pt-4">
            <p class="label text-signal">{{ p.k }}</p>
            <p class="mt-2 text-[15.5px] leading-snug text-on-dark-muted">{{ p.v }}</p>
          </li>
        </ul>
        <slot name="aside" />
      </div>
    </aside>
  </section>
</template>

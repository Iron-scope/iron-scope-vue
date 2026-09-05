<script setup>
import { TRAINING, RIA_REBUTTALS, GENERAL_RESOURCES } from '@/content/resources.js'
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">Staff Only</p>
    <h1 class="display-2 mt-4 text-ink">Resources &amp; Training</h1>
    <p class="lede mt-4 max-w-2xl text-ink-2">Reference material for writing and defending estimates — not visible to customers.</p>

    <section class="mt-14">
      <h2 class="display-3 border-b border-hairline pb-3 text-ink">Training</h2>
      <div class="mt-6 grid gap-6 md:grid-cols-2">
        <div v-for="item in TRAINING" :key="item.title" class="rounded-card border-2 border-rule bg-surface p-5">
          <p class="text-[15px] font-bold text-ink">{{ item.title }}</p>
          <p class="mt-2 text-[14px] leading-relaxed text-ink-2">{{ item.description }}</p>
        </div>
      </div>
    </section>

    <section class="mt-14">
      <h2 class="display-3 border-b border-hairline pb-3 text-ink">IICRC / RIA Rebuttal Reference</h2>
      <div class="mt-6 grid gap-6 md:grid-cols-2">
        <div v-for="item in RIA_REBUTTALS" :key="item.scenario" class="rounded-card border-2 border-rule bg-surface p-5">
          <p class="text-[15px] font-bold text-ink">{{ item.scenario }}</p>
          <p class="mt-2 text-[14px] leading-relaxed text-ink-2">{{ item.rebuttal }}</p>
        </div>
      </div>
    </section>

    <section class="mt-14">
      <h2 class="display-3 border-b border-hairline pb-3 text-ink">General Resources</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <a
          v-for="item in GENERAL_RESOURCES"
          :key="item.title"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-card border-2 border-rule bg-surface px-4 py-3.5 text-center text-[14px] font-semibold text-ink hover:border-ink"
        >
          {{ item.title }} ↗
        </a>
      </div>
    </section>
  </section>
</template>

<script setup>
import { requirements } from '@/content/site.js'
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">{{ requirements.eyebrow }}</p>
    <h1 class="display-2 mt-4 max-w-3xl text-ink">{{ requirements.title }}</h1>
    <p class="lede mt-5 max-w-2xl text-ink-2">{{ requirements.lede }}</p>

    <div class="mt-8 max-w-2xl border-l-4 border-rust bg-inset px-5 py-4 text-[15px] leading-relaxed text-ink-2">
      {{ requirements.callout }}
    </div>

    <div class="mt-14 grid gap-12 md:grid-cols-3">
      <div v-for="group in requirements.groups" :key="group.title">
        <h2 class="display-3 text-ink">{{ group.title }}</h2>
        <ul class="mt-5 space-y-3 text-[15px] leading-relaxed text-ink-2">
          <li v-for="(item, i) in group.items" :key="i" class="flex gap-2.5">
            <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-rust" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

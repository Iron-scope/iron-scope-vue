<script setup>
import { about, credentials } from '@/content/site.js'
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">{{ about.eyebrow }}</p>
    <h1 class="display-2 mt-4 max-w-3xl text-ink">{{ about.title }}</h1>
    <p class="lede mt-5 max-w-2xl text-ink-2">{{ about.lede }}</p>

    <div class="mt-14 max-w-2xl border-t border-hairline pt-10">
      <p class="label text-rust">{{ about.storyEyebrow }}</p>
      <p class="display-3 mt-4 text-ink">{{ about.story }}</p>
      <p class="mt-5 text-[16px] leading-relaxed text-ink-2">{{ about.teamNote }}</p>
    </div>

    <ul class="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-hairline pt-8">
      <li v-for="c in credentials" :key="c.label" class="text-[14px] font-semibold text-ink-2">
        <a v-if="c.external" :href="c.href" target="_blank" rel="noopener noreferrer" class="underline underline-offset-4 hover:text-ink">
          {{ c.label }}
        </a>
        <span v-else>{{ c.label }}</span>
      </li>
    </ul>
  </section>
</template>

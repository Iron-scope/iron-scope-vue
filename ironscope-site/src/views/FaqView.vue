<script setup>
import { ref } from 'vue'
import { faqs } from '@/content/faq.js'

const openIndex = ref(0)
function toggle(i) {
  openIndex.value = openIndex.value === i ? -1 : i
}
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">FAQ</p>
    <h1 class="display-2 mt-4 max-w-2xl text-ink">Questions, answered.</h1>

    <div class="mt-12 max-w-3xl divide-y divide-hairline border-t border-b border-hairline">
      <div v-for="(f, i) in faqs" :key="f.q">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-6 py-5 text-left"
          :aria-expanded="openIndex === i"
          @click="toggle(i)"
        >
          <span class="text-[16px] font-bold text-ink">{{ f.q }}</span>
          <span class="shrink-0 text-[20px] leading-none text-rust">{{ openIndex === i ? '−' : '+' }}</span>
        </button>
        <p v-if="openIndex === i" class="max-w-2xl pb-6 text-[15px] leading-relaxed text-ink-2">
          {{ f.a }}
        </p>
      </div>
    </div>
  </section>
</template>

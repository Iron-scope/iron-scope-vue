<script setup>
import { reactive, ref } from 'vue'
import { api } from '@/lib/api'

const form = reactive({ name: '', email: '', phone: '', message: '' })
const status = ref('idle') // idle | submitting | success | error
const errorMsg = ref('')

// recaptchaToken sent as null -- see the note in RegisterView.vue; the real
// backend fails open on this in dev, but a real widget is needed pre-launch.
async function onSubmit() {
  status.value = 'submitting'
  errorMsg.value = ''
  try {
    await api.post('/api/contact', { ...form, recaptchaToken: null })
    status.value = 'success'
  } catch (err) {
    errorMsg.value = err.message
    status.value = 'error'
  }
}
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">Contact</p>
    <h1 class="display-2 mt-4 max-w-2xl text-ink">Get in touch.</h1>
    <p class="lede mt-5 max-w-xl text-ink-2">
      Questions about a job, your account, or how we work — send us a message and
      we'll get back to you.
    </p>

    <div class="mt-10 max-w-xl">
      <div v-if="status === 'success'" role="status" class="border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2">
        Message sent — we'll get back to you shortly.
      </div>

      <form v-else novalidate class="space-y-6" @submit.prevent="onSubmit">
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label class="label text-ink-2" for="name">Name</label>
            <input id="name" v-model="form.name" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
          </div>
          <div>
            <label class="label text-ink-2" for="phone">Phone</label>
            <input id="phone" v-model="form.phone" type="tel" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
          </div>
        </div>
        <div>
          <label class="label text-ink-2" for="email">Email</label>
          <input id="email" v-model="form.email" type="email" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
        <div>
          <label class="label text-ink-2" for="message">Message</label>
          <textarea id="message" v-model="form.message" required rows="5" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
        <button type="submit" class="btn btn-signal w-full" :disabled="status === 'submitting'">
          {{ status === 'submitting' ? 'Sending...' : 'Send message' }}
        </button>
        <p v-if="status === 'error'" role="alert" class="text-[14.5px] leading-relaxed text-ink-2">
          {{ errorMsg }}
        </p>
      </form>
    </div>
  </section>
</template>

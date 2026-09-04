<script setup>
import { ref } from 'vue'
import AuthShell from '@/components/AuthShell.vue'
import FormField from '@/components/FormField.vue'
import { api } from '@/lib/api'

const email = ref('')
const status = ref('idle') // idle | submitting | success | error
const errorMsg = ref('')

/**
 * Reset emails link back to NEXTAUTH_URL + /reset-password, which today
 * still points at the existing Next.js app (mitigation-platform) -- exactly
 * right for now, since that app stays the live, working site until a real
 * production cutover. /reset-password itself isn't built here yet (Phase 2).
 */
async function onSubmit() {
  status.value = 'submitting'
  errorMsg.value = ''
  try {
    await api.post('/api/auth/forgot-password', { email: email.value })
    status.value = 'success'
  } catch (err) {
    errorMsg.value = err.message
    status.value = 'error'
  }
}
</script>

<template>
  <AuthShell
    eyebrow="Account"
    title="Reset your password"
    lede="Enter your email and we'll send you a reset link."
    aside-title="Locked out?"
    :aside-points="[{ k: 'Check your inbox', v: 'The link expires in one hour, and also lands in spam sometimes.' }]"
  >
    <div v-if="status === 'success'" role="status" class="border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2">
      If an account exists for that email, a reset link has been sent. Check your inbox
      (and spam folder) for a message from Iron Scope.
    </div>

    <form v-else novalidate class="space-y-6" @submit.prevent="onSubmit">
      <FormField v-model="email" label="Email" type="email" autocomplete="email" required />
      <button type="submit" class="btn btn-signal w-full" :disabled="status === 'submitting'">
        {{ status === 'submitting' ? 'Sending...' : 'Send reset link' }}
      </button>
      <p v-if="status === 'error'" role="alert" class="text-[14.5px] leading-relaxed text-ink-2">
        {{ errorMsg }}
      </p>
    </form>

    <p class="mt-8 text-[15px] text-ink-2">
      <RouterLink to="/login" class="font-semibold text-rust underline underline-offset-4">
        Back to log in
      </RouterLink>
    </p>
  </AuthShell>
</template>

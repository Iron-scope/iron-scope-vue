<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/lib/api'

const route = useRoute()
const router = useRouter()

const token = typeof route.query.token === 'string' ? route.query.token : ''
const password = ref('')
const confirmPassword = ref('')
const status = ref('idle')
const errorMsg = ref('')

async function onSubmit() {
  errorMsg.value = ''
  if (password.value !== confirmPassword.value) {
    errorMsg.value = "Passwords don't match."
    return
  }
  if (!token) {
    errorMsg.value = 'Missing or invalid reset link. Request a new one.'
    return
  }

  status.value = 'submitting'
  try {
    await api.post('/api/auth/reset-password', { token, newPassword: password.value })
    status.value = 'success'
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    errorMsg.value = err.message
    status.value = 'error'
  }
}
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">Account</p>
    <h1 class="display-2 mt-4 text-ink">Set a New Password</h1>
    <p class="lede mt-4 max-w-xl text-ink-2">Choose a new password for your account.</p>

    <div class="mt-10 max-w-md">
      <p v-if="status === 'success'" role="status" class="border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2">
        Password updated — redirecting you to log in...
      </p>
      <form v-else novalidate class="space-y-6" @submit.prevent="onSubmit">
        <div>
          <label class="label text-ink-2" for="password">New Password</label>
          <input id="password" v-model="password" type="password" required minlength="8" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
        <div>
          <label class="label text-ink-2" for="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" required minlength="8" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
        <button type="submit" class="btn btn-signal w-full" :disabled="status === 'submitting'">
          {{ status === 'submitting' ? 'Updating...' : 'Update Password' }}
        </button>
        <p v-if="errorMsg" role="alert" class="text-[14.5px] font-medium text-rust">{{ errorMsg }}</p>
      </form>
    </div>
  </section>
</template>

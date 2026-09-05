<script setup>
import { ref } from 'vue'
import { api } from '@/lib/api'
import { useSession } from '@/composables/useSession'
import { signOut } from '@/lib/auth'

const { user } = useSession()
const status = ref('idle')
const errorMsg = ref('')

async function resendEmail() {
  if (!user.value?.email) return
  status.value = 'submitting'
  errorMsg.value = ''
  try {
    await api.post('/api/auth/forgot-password', { email: user.value.email })
    status.value = 'sent'
  } catch (err) {
    errorMsg.value = err.message
    status.value = 'error'
  }
}

async function logOut() {
  await signOut()
  window.location.href = '/login'
}
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">Account</p>
    <h1 class="display-2 mt-4 max-w-2xl text-ink">Password Reset Required</h1>
    <p class="lede mt-4 max-w-xl text-ink-2">
      Your account needs a new password before you can continue. Check
      <strong v-if="user?.email">{{ user.email }}</strong><template v-else>your email</template> for a reset link.
    </p>

    <div class="mt-10 max-w-md">
      <p v-if="status === 'sent'" role="status" class="border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2">
        A new reset link has been sent — it's valid for 1 hour.
      </p>
      <template v-else>
        <p class="text-[14px] text-ink-2">Didn't get the email, or the link expired?</p>
        <button class="btn btn-signal mt-4 w-full" :disabled="status === 'submitting'" @click="resendEmail">
          {{ status === 'submitting' ? 'Sending...' : 'Resend Reset Link' }}
        </button>
        <p v-if="status === 'error'" role="alert" class="mt-3 text-[14.5px] font-medium text-rust">{{ errorMsg }}</p>
      </template>
      <button class="btn btn-outline mt-4 w-full" @click="logOut">Log Out</button>
    </div>
  </section>
</template>

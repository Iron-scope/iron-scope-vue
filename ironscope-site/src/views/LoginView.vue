<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
import FormField from '@/components/FormField.vue'
import GoogleButton from '@/components/GoogleButton.vue'
import { signInCredentials, signInGoogle } from '@/lib/auth'
import { useSession } from '@/composables/useSession'

const route = useRoute()
const router = useRouter()
const { fetchSession } = useSession()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const formError = ref('')
const loading = ref(false)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const callbackUrl = () =>
  typeof route.query.callbackUrl === 'string' ? route.query.callbackUrl : '/dashboard'

/**
 * Mirrors app/login/page.js in the Next.js app exactly, including the
 * ACCOUNT_DEACTIVATED redirect -- lib/auth.js's authorize() throws that
 * specific message for a deactivated account, and the real site catches it
 * the same way, so a deactivated account gets bounced to /contact from
 * either frontend.
 */
async function onSubmit() {
  errors.email = EMAIL.test(form.email.trim()) ? '' : 'Enter a valid email address.'
  errors.password = form.password ? '' : 'Enter your password.'
  formError.value = ''
  if (errors.email || errors.password) return

  loading.value = true
  try {
    const res = await signInCredentials(form.email.trim(), form.password)
    if (res.error === 'ACCOUNT_DEACTIVATED') {
      router.push('/contact')
      return
    }
    if (res.error) {
      formError.value = 'Invalid email or password.'
      return
    }
    await fetchSession()
    router.push(callbackUrl())
  } catch (err) {
    formError.value = `Something went wrong signing in: ${err.message}`
  } finally {
    loading.value = false
  }
}

function onGoogle() {
  signInGoogle(callbackUrl())
}

const asidePoints = [
  { k: 'Your queue', v: 'Every request, its status, and what we are still waiting on from you.' },
  { k: 'Rates & invoices', v: 'Your fee schedule, deposits paid, and the balance on each approved RCV.' },
  { k: 'Files', v: 'Completed ESX files and carrier-ready PDFs, kept together by claim.' },
]
</script>

<template>
  <AuthShell
    eyebrow="Account"
    title="Log in"
    lede="Get to your queue, your files, and your rates."
    aside-title="Everything on your jobs, in one place."
    :aside-points="asidePoints"
  >
    <GoogleButton @click="onGoogle" />

    <div class="my-7 flex items-center gap-4" aria-hidden="true">
      <span class="h-px flex-1 bg-rule/50" />
      <span class="label text-muted">or</span>
      <span class="h-px flex-1 bg-rule/50" />
    </div>

    <form novalidate class="space-y-6" @submit.prevent="onSubmit">
      <FormField
        v-model="form.email"
        label="Email"
        type="email"
        autocomplete="email"
        required
        :error="errors.email"
      />
      <FormField
        v-model="form.password"
        label="Password"
        type="password"
        autocomplete="current-password"
        required
        :error="errors.password"
      />

      <button type="submit" class="btn btn-signal w-full" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Log in' }}
      </button>
    </form>

    <p
      v-if="formError"
      role="alert"
      class="mt-6 border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2"
    >
      {{ formError }}
    </p>

    <div class="mt-8 space-y-2 text-[15px]">
      <p>
        <RouterLink to="/forgot-password" class="font-semibold text-rust underline underline-offset-4">
          Forgot your password?
        </RouterLink>
      </p>
      <p class="text-ink-2">
        No account yet?
        <RouterLink to="/register" class="font-semibold text-rust underline underline-offset-4">
          Create one
        </RouterLink>
      </p>
    </div>
  </AuthShell>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
import FormField from '@/components/FormField.vue'
import GoogleButton from '@/components/GoogleButton.vue'
import { api } from '@/lib/api'
import { signInCredentials, signInGoogle } from '@/lib/auth'
import { useSession } from '@/composables/useSession'

const router = useRouter()
const { fetchSession } = useSession()

const form = reactive({
  company: '',
  contactName: '',
  phone: '',
  email: '',
  password: '',
  agreed: false,
})
const errors = reactive({
  company: '',
  contactName: '',
  phone: '',
  email: '',
  password: '',
  agreed: '',
})
const formError = ref('')
const loading = ref(false)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Mirrors app/signup/page.js: create the account, then auto sign-in with
 * the same credentials rather than making the user log in a second time
 * right after registering.
 *
 * recaptchaToken is sent as null -- the real backend's verifyRecaptcha()
 * fails open (skips verification) when RECAPTCHA_SECRET_KEY isn't set,
 * which is the case in this dev environment. Wiring an actual reCAPTCHA
 * widget here is still needed before this goes anywhere near production,
 * same as the real signup page has one (components/Recaptcha.js).
 */
async function onSubmit() {
  errors.company = form.company.trim() ? '' : 'Enter your company name.'
  errors.contactName = form.contactName.trim() ? '' : 'Enter a contact name.'
  errors.phone = form.phone.trim() ? '' : 'Enter a contact phone number.'
  errors.email = EMAIL.test(form.email.trim()) ? '' : 'Enter a valid email address.'
  errors.password = form.password.length >= 8 ? '' : 'Use at least 8 characters.'
  errors.agreed = form.agreed ? '' : 'You need to accept the agreements to continue.'
  formError.value = ''
  if (Object.values(errors).some(Boolean)) return

  loading.value = true
  try {
    await api.post('/api/auth/signup', {
      companyName: form.company.trim(),
      contactName: form.contactName.trim(),
      contactPhone: form.phone.trim(),
      email: form.email.trim(),
      password: form.password,
      agreedToTerms: form.agreed,
      recaptchaToken: null,
    })

    const signInRes = await signInCredentials(form.email.trim(), form.password)
    if (signInRes.error) {
      router.push('/login')
      return
    }
    await fetchSession()
    router.push('/dashboard')
  } catch (err) {
    formError.value = err.message
  } finally {
    loading.value = false
  }
}

function onGoogle() {
  signInGoogle('/dashboard')
}

const asidePoints = [
  { k: 'First 3 on us', v: 'Small estimates under $10,000 RCV are free to start — no card, no subscription.' },
  { k: 'No commitment', v: 'No subscription, no minimum, nothing to cancel. You pay per estimate.' },
  { k: 'Submit right away', v: 'Send your first file as soon as the account exists.' },
]
</script>

<template>
  <AuthShell
    eyebrow="Account"
    title="Create an account"
    lede="Free to join. Your first three small estimates are on us."
    aside-title="Read our work before you commit to anything."
    :aside-points="asidePoints"
  >
    <GoogleButton label="Sign up with Google" @click="onGoogle" />

    <div class="my-7 flex items-center gap-4" aria-hidden="true">
      <span class="h-px flex-1 bg-rule/50" />
      <span class="label text-muted">or</span>
      <span class="h-px flex-1 bg-rule/50" />
    </div>

    <form novalidate class="space-y-6" @submit.prevent="onSubmit">
      <FormField
        v-model="form.company"
        label="Company name"
        autocomplete="organization"
        required
        :error="errors.company"
      />

      <div class="grid gap-6 sm:grid-cols-2">
        <FormField
          v-model="form.contactName"
          label="Contact name"
          autocomplete="name"
          required
          :error="errors.contactName"
        />
        <FormField
          v-model="form.phone"
          label="Phone"
          type="tel"
          autocomplete="tel"
          required
          :error="errors.phone"
        />
      </div>
      <p class="-mt-2 text-[14px] leading-relaxed text-muted">
        Your name and number auto-fill on every request, so you are not
        re-entering them each time.
      </p>

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
        autocomplete="new-password"
        required
        hint="At least 8 characters."
        :error="errors.password"
      />

      <div>
        <label class="flex items-start gap-3">
          <input
            v-model="form.agreed"
            type="checkbox"
            class="mt-1 h-[18px] w-[18px] shrink-0 accent-[color:var(--color-signal)]"
            :aria-invalid="errors.agreed ? 'true' : undefined"
          />
          <span class="text-[15px] leading-relaxed text-ink-2">
            I agree to the
            <RouterLink to="/agreement" class="font-semibold text-rust underline underline-offset-2">Service Agreement</RouterLink>,
            <RouterLink to="/terms" class="font-semibold text-rust underline underline-offset-2">Terms</RouterLink>,
            and
            <RouterLink to="/eula" class="font-semibold text-rust underline underline-offset-2">EULA</RouterLink>.
          </span>
        </label>
        <p v-if="errors.agreed" class="mt-2 text-[14px] font-medium text-rust">
          {{ errors.agreed }}
        </p>
      </div>

      <button type="submit" class="btn btn-signal w-full" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Create account' }}
      </button>
    </form>

    <p
      v-if="formError"
      role="alert"
      class="mt-6 border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2"
    >
      {{ formError }}
    </p>

    <p class="mt-8 text-[15px] text-ink-2">
      Already have an account?
      <RouterLink to="/login" class="font-semibold text-rust underline underline-offset-4">
        Log in
      </RouterLink>
    </p>
  </AuthShell>
</template>

<script setup>
import { reactive, ref } from 'vue'
import AuthShell from '@/components/AuthShell.vue'
import FormField from '@/components/FormField.vue'
import GoogleButton from '@/components/GoogleButton.vue'

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
  email: '',
  password: '',
  agreed: '',
})
const notice = ref(false)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * UI only. No account is created and nothing leaves the browser. Point this at
 * the registration endpoint when it exists — and do not make it claim success
 * before it does.
 */
function onSubmit() {
  errors.company = form.company.trim() ? '' : 'Enter your company name.'
  errors.contactName = form.contactName.trim() ? '' : 'Enter a contact name.'
  errors.email = EMAIL.test(form.email.trim()) ? '' : 'Enter a valid email address.'
  errors.password = form.password.length >= 8 ? '' : 'Use at least 8 characters.'
  errors.agreed = form.agreed ? '' : 'You need to accept the agreements to continue.'
  notice.value = !Object.values(errors).some(Boolean)
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
    <GoogleButton label="Sign up with Google" />

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

      <button type="submit" class="btn btn-signal w-full">Create account</button>
    </form>

    <p
      v-if="notice"
      role="status"
      class="mt-6 border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2"
    >
      Your details passed validation, but no registration backend is connected to
      this build — no account was created and nothing was submitted.
    </p>

    <p class="mt-8 text-[15px] text-ink-2">
      Already have an account?
      <RouterLink to="/login" class="font-semibold text-rust underline underline-offset-4">
        Log in
      </RouterLink>
    </p>
  </AuthShell>
</template>

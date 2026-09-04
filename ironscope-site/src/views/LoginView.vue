<script setup>
import { reactive, ref } from 'vue'
import AuthShell from '@/components/AuthShell.vue'
import FormField from '@/components/FormField.vue'
import GoogleButton from '@/components/GoogleButton.vue'

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const notice = ref(false)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * UI only. No identity provider is wired into this build: nothing is
 * transmitted and no session is created. Replace the body of this function
 * with the real sign-in call. It deliberately does not fake success.
 */
function onSubmit() {
  errors.email = EMAIL.test(form.email.trim()) ? '' : 'Enter a valid email address.'
  errors.password = form.password ? '' : 'Enter your password.'
  notice.value = !errors.email && !errors.password
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
    <GoogleButton />

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

      <button type="submit" class="btn btn-signal w-full">Log in</button>
    </form>

    <p
      v-if="notice"
      role="status"
      class="mt-6 border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2"
    >
      Your details passed validation, but no authentication provider is connected
      to this build — nothing was submitted and no session was created.
    </p>

    <div class="mt-8 space-y-2 text-[15px]">
      <p>
        <a href="#" class="font-semibold text-rust underline underline-offset-4">
          Forgot your password?
        </a>
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

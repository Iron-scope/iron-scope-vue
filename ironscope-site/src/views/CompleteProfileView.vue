<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import { useSession } from '@/composables/useSession'

const router = useRouter()
const { user, fetchSession } = useSession()

const form = reactive({ companyName: '', contactName: '', contactPhone: '', agreedToTerms: false })
const error = ref('')
const loading = ref(false)

watch(
  user,
  (u) => {
    if (u?.contactName && !form.contactName) form.contactName = u.contactName
  },
  { immediate: true }
)

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await api.post('/api/auth/complete-profile', { ...form })
    await fetchSession()
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">Almost There</p>
    <h1 class="display-2 mt-4 text-ink">Complete Your Profile</h1>
    <p class="lede mt-4 max-w-xl text-ink-2">One more step — we need your company info before you can submit requests.</p>

    <form novalidate class="mt-10 max-w-xl space-y-6" @submit.prevent="onSubmit">
      <div>
        <label class="label text-ink-2" for="companyName">Company Name</label>
        <input id="companyName" v-model="form.companyName" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
      </div>
      <div class="grid gap-6 sm:grid-cols-2">
        <div>
          <label class="label text-ink-2" for="contactName">Contact Name</label>
          <input id="contactName" v-model="form.contactName" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
        <div>
          <label class="label text-ink-2" for="contactPhone">Contact Phone</label>
          <input id="contactPhone" v-model="form.contactPhone" type="tel" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
      </div>

      <label class="flex items-start gap-3 text-[14px] leading-relaxed text-ink-2">
        <input v-model="form.agreedToTerms" type="checkbox" required class="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[color:var(--color-signal)]" />
        <span>
          I agree to the
          <RouterLink to="/agreement" target="_blank" class="font-semibold text-rust underline">Service Agreement</RouterLink>,
          <RouterLink to="/terms" target="_blank" class="font-semibold text-rust underline">Terms &amp; Conditions</RouterLink>,
          and
          <RouterLink to="/eula" target="_blank" class="font-semibold text-rust underline">EULA</RouterLink>.
        </span>
      </label>

      <button type="submit" class="btn btn-signal w-full" :disabled="loading">{{ loading ? 'Saving...' : 'Continue to Dashboard' }}</button>
      <p v-if="error" role="alert" class="text-[14.5px] font-medium text-rust">{{ error }}</p>
    </form>
  </section>
</template>

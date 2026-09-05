<script setup>
import { ref, computed } from 'vue'
import { api } from '@/lib/api'
import { useSession } from '@/composables/useSession'
import { IRONCLAD_TIERS } from '@/lib/ironcladTiers'

const { user, isSignedIn, fetchSession } = useSession()

const loadingTier = ref(null)
const error = ref('')
const confirmingCancelId = ref(null)
const canceling = ref(false)

async function handleSubscribe(tierId) {
  loadingTier.value = tierId
  error.value = ''
  try {
    const data = await api.post('/api/stripe/checkout', { tierId })
    window.location.href = data.url
  } catch (err) {
    error.value = err.message
    loadingTier.value = null
  }
}

async function handleCancel() {
  canceling.value = true
  error.value = ''
  try {
    await api.post('/api/stripe/cancel-subscription', {})
    confirmingCancelId.value = null
    await fetchSession()
  } catch (err) {
    error.value = err.message
  } finally {
    canceling.value = false
  }
}

const currentTier = computed(() => user.value?.ironcladTier)
const isActive = computed(() => user.value?.subscriptionStatus === 'active')
const cancelAtPeriodEnd = computed(() => Boolean(user.value?.subscriptionCancelAtPeriodEnd))
const periodEndDate = computed(() =>
  user.value?.currentPeriodEnd
    ? new Date(user.value.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null
)
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">Subscription</p>
    <h1 class="display-2 mt-4 text-ink">Ironclad</h1>
    <p class="lede mt-4 max-w-2xl text-ink-2">
      Rebuttal support and guaranteed turnaround, priced to your monthly volume. Pick the tier that fits — you can
      change tiers as your volume changes.
    </p>

    <div class="mt-8 max-w-2xl border-l-4 border-rust bg-inset px-5 py-4 text-[15px] leading-relaxed text-ink-2">
      <strong class="text-ink">Ironclad is a support subscription, not a jobs package.</strong>
      It doesn't include free or discounted estimates — every job still bills the standard estimate-writing fee
      from <RouterLink to="/pricing" class="underline">Pricing</RouterLink>. What you're subscribing to is
      rebuttal support and a guaranteed SLA on up to your tier's job count and RCV volume each month.
    </div>

    <p v-if="error" role="alert" class="mt-6 text-[14.5px] font-medium text-rust">{{ error }}</p>

    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <div
        v-for="tier in IRONCLAD_TIERS"
        :key="tier.id"
        class="relative rounded-card border-2 p-6"
        :class="isActive && currentTier === tier.id ? 'border-ink' : 'border-rule'"
      >
        <span v-if="isActive && currentTier === tier.id" class="label absolute -top-3 left-5 rounded-full bg-ink px-3 py-1 text-page">
          Current plan
        </span>
        <span v-if="tier.id === 'tier3'" class="label absolute -top-3 right-5 rounded-full bg-signal px-3 py-1 text-ink">
          Popular
        </span>
        <p class="display-3 text-ink">{{ tier.name }}</p>
        <p class="mt-2 text-[13px] text-ink-2">Up to ${{ tier.volumeCeiling.toLocaleString() }}/mo</p>
        <p class="figure mt-4 text-[32px] text-ink">${{ tier.priceDollars }}<span class="text-[15px] font-normal text-ink-2">/mo</span></p>
        <p class="mt-2 text-[13px] text-ink-2">Ironclad support for up to {{ tier.includedJobs }} jobs/mo</p>

        <RouterLink v-if="!isSignedIn" to="/login?callbackUrl=/upgrade" class="btn btn-outline mt-6 w-full">
          Log in to subscribe
        </RouterLink>

        <template v-else-if="isActive && currentTier === tier.id">
          <button class="btn btn-outline mt-6 w-full" disabled>Active</button>
          <p v-if="cancelAtPeriodEnd" class="mt-3 text-[13px] text-ink-2">
            Cancellation scheduled — access continues{{ periodEndDate ? ` through ${periodEndDate}` : ' through the end of this billing period' }}.
          </p>
          <div v-else-if="confirmingCancelId === tier.id" class="mt-3 space-y-2">
            <p class="text-[13px] font-medium text-rust">
              This ends Ironclad at the end of your current billing period — you keep access until then. Confirm?
            </p>
            <div class="flex gap-2">
              <button class="btn btn-outline" :disabled="canceling" @click="handleCancel">{{ canceling ? 'Canceling...' : 'Yes, Cancel' }}</button>
              <button class="btn btn-outline" :disabled="canceling" @click="confirmingCancelId = null">Never Mind</button>
            </div>
          </div>
          <button v-else class="btn btn-outline mt-3 w-full" @click="confirmingCancelId = tier.id">Cancel Subscription</button>
        </template>

        <button v-else class="btn btn-signal mt-6 w-full" :disabled="loadingTier === tier.id" @click="handleSubscribe(tier.id)">
          {{ loadingTier === tier.id ? 'Redirecting...' : 'Subscribe' }}
        </button>
      </div>

      <div class="rounded-card border-2 border-dashed border-rule p-6">
        <p class="display-3 text-ink">Enterprise</p>
        <p class="mt-2 text-[13px] text-ink-2">Over $1,000,000/mo</p>
        <p class="mt-4 text-[22px] font-bold text-ink">Custom</p>
        <p class="mt-2 text-[13px] text-ink-2">Volume-scaled terms</p>
        <RouterLink to="/contact" class="btn btn-signal mt-6 w-full">Contact Us</RouterLink>
      </div>
    </div>

    <div class="mt-10 max-w-2xl border-l-4 border-rust bg-inset px-5 py-4 text-[15px] text-ink-2">
      Ironclad is optional — your base account never requires a subscription. See
      <RouterLink to="/pricing" class="underline">Pricing</RouterLink> for what's included with every estimate.
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { api } from '@/lib/api'
import { computeDeposit } from '@/lib/deposit'
import { useSession } from '@/composables/useSession'

const { user, fetchSession } = useSession()

const initialState = {
  lossType: '',
  propertyAddress: '',
  carrierName: '',
  claimNumber: '',
  dateOfLoss: '',
  estimatedRcv: '',
  needsConsultation: false,
  turnaround: 'STANDARD',
  scopeNotes: '',
  documentationLinks: '',
  scanLink: '',
  adjusterName: '',
  adjusterPhone: '',
  adjusterEmail: '',
  ironcladSupportRequested: false,
}

const form = reactive({ ...initialState })
const status = ref('idle') // idle | submitting | success | error | custom | consultation | free
const errorMsg = ref('')
const lastId = ref(null)

const deposit = computed(() => (form.needsConsultation ? null : computeDeposit(form.estimatedRcv)))
const hasActiveIronclad = computed(() => user.value?.subscriptionStatus === 'active' && Boolean(user.value?.ironcladTier))
const freeRemaining = computed(() => (user.value ? Math.max(0, 3 - (user.value.freeEstimatesUsed || 0)) : null))
const rcvNum = computed(() => Number(form.estimatedRcv) || 0)
const willBeFree = computed(
  () =>
    !form.needsConsultation &&
    form.estimatedRcv !== '' &&
    rcvNum.value <= 10000 &&
    freeRemaining.value !== null &&
    freeRemaining.value > 0
)

const submitLabel = computed(() => {
  if (status.value === 'submitting') return 'Submitting...'
  if (form.needsConsultation) return 'Submit Request'
  if (willBeFree.value) return 'Submit Estimate — Free'
  if (deposit.value?.isCustom) return 'Submit Request'
  return `Submit & Pay ${deposit.value?.label || ''} Deposit`
})

function resetForm() {
  Object.assign(form, initialState)
}

async function onSubmit() {
  status.value = 'submitting'
  errorMsg.value = ''
  try {
    const data = await api.post('/api/requests', { ...form })
    const requestId = data.request.id
    lastId.value = requestId

    if (form.needsConsultation) {
      status.value = 'consultation'
      resetForm()
      return
    }

    if (data.request.isFreeEstimate) {
      status.value = 'free'
      resetForm()
      await fetchSession()
      return
    }

    if (deposit.value.isCustom) {
      status.value = 'custom'
      resetForm()
      return
    }

    const checkoutData = await api.post('/api/stripe/deposit-checkout', { requestId })
    window.location.href = checkoutData.url
  } catch (err) {
    errorMsg.value = err.message
    status.value = 'error'
  }
}
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">New Request</p>
    <h1 class="display-2 mt-4 text-ink">Submit a Job</h1>
    <p class="lede mt-4 max-w-2xl text-ink-2">
      Give us the loss basics and carrier info. We'll queue it and get an estimate back to you.
    </p>
    <p class="mt-3 max-w-2xl text-[14px] text-ink-2">
      The more complete and accurate this is, the faster we can turn it around — if we have to come back and ask
      for missing info, that adds time to your delivery. When in doubt, include it.
    </p>

    <div v-if="user" class="mt-8 max-w-2xl border-l-4 border-rust bg-inset px-5 py-4 text-[15px] text-ink-2">
      Submitting as <strong class="text-ink">{{ user.companyName }}</strong> — {{ user.contactName }}
      <template v-if="user.contactPhone"> · {{ user.contactPhone }}</template>
      <template v-if="freeRemaining !== null">
        <br />
        <template v-if="freeRemaining > 0">
          <strong class="text-rust">{{ freeRemaining }} free estimate{{ freeRemaining === 1 ? '' : 's' }}</strong>
          remaining (small estimates under $10,000 only).
        </template>
        <template v-else>You've used all 3 free estimates — future requests bill normally.</template>
      </template>
    </div>

    <form novalidate class="mt-10 max-w-2xl space-y-6" @submit.prevent="onSubmit">
      <div class="grid gap-6 sm:grid-cols-2">
        <div>
          <label class="label text-ink-2" for="lossType">Loss Type</label>
          <select id="lossType" v-model="form.lossType" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink">
            <option value="">Select...</option>
            <option value="WATER">Water</option>
            <option value="FIRE">Fire</option>
            <option value="MOLD">Mold</option>
            <option value="STORM">Storm</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label class="label text-ink-2" for="dateOfLoss">Date of Loss</label>
          <input id="dateOfLoss" v-model="form.dateOfLoss" type="date" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
      </div>

      <div>
        <label class="label text-ink-2" for="propertyAddress">Property Address</label>
        <input id="propertyAddress" v-model="form.propertyAddress" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        <div>
          <label class="label text-ink-2" for="carrierName">Carrier</label>
          <input id="carrierName" v-model="form.carrierName" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
        <div>
          <label class="label text-ink-2" for="claimNumber">Claim Number</label>
          <input id="claimNumber" v-model="form.claimNumber" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
      </div>

      <label class="flex items-center gap-3 text-[15px] text-ink-2">
        <input v-model="form.needsConsultation" type="checkbox" class="h-[18px] w-[18px] accent-[color:var(--color-signal)]" />
        Not sure yet — I need a consultation before I can estimate RCV
      </label>

      <div v-if="!form.needsConsultation">
        <label class="label text-ink-2" for="estimatedRcv">Estimated RCV ($)</label>
        <input
          id="estimatedRcv"
          v-model="form.estimatedRcv"
          type="number"
          min="0"
          step="1"
          :required="!form.needsConsultation"
          placeholder="Your best estimate of the project's replacement cost value"
          class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink"
        />
        <p v-if="form.estimatedRcv !== ''" class="mt-2 text-[14px] text-ink-2">
          <template v-if="willBeFree">
            Deposit due at submission: <strong class="text-rust">Free</strong> — this uses one of your
            {{ freeRemaining }} remaining free estimates.
          </template>
          <template v-else>
            Deposit due at submission: <strong class="text-rust">{{ deposit.label }}</strong>
            <template v-if="deposit.isCustom"> — we'll reach out to arrange payment for losses over $100k</template>
            <template v-else-if="rcvNum > 0 && rcvNum <= 10000"> — this is the full fee, paid in full now. Nothing else is billed later for this request.</template>
          </template>
        </p>
      </div>

      <div>
        <label class="label text-ink-2" for="turnaround">Turnaround</label>
        <select id="turnaround" v-model="form.turnaround" required class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink">
          <option value="STANDARD">Standard</option>
          <option value="RUSH">Rush</option>
        </select>
      </div>

      <div>
        <label class="label text-ink-2" for="scopeNotes">Scope Notes</label>
        <textarea id="scopeNotes" v-model="form.scopeNotes" required rows="4" placeholder="Rooms affected, equipment placed, moisture readings, anything the estimator should know..." class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
      </div>

      <div>
        <label class="label text-ink-2" for="documentationLinks">Photo / Video Links</label>
        <textarea id="documentationLinks" v-model="form.documentationLinks" required rows="3" placeholder="Paste one link per line — Google Drive, Dropbox, OneDrive, or any shared folder link works." class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        <p class="mt-2 text-[13px] text-ink-2">
          Make sure link sharing is turned on ("Anyone with the link") before submitting — we won't be able to
          request access separately.
        </p>
      </div>

      <div>
        <label class="label text-ink-2" for="scanLink">3D Scan Link</label>
        <input id="scanLink" v-model="form.scanLink" required placeholder="Matterport, DocuSketch, or HOVER share link" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
      </div>

      <div class="border-t border-hairline pt-6">
        <p class="label text-ink-2">Adjuster Contact (optional)</p>
        <div class="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <label class="label text-ink-2" for="adjusterName">Adjuster Name</label>
            <input id="adjusterName" v-model="form.adjusterName" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
          </div>
          <div>
            <label class="label text-ink-2" for="adjusterPhone">Adjuster Phone</label>
            <input id="adjusterPhone" v-model="form.adjusterPhone" type="tel" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
          </div>
        </div>
        <div class="mt-6">
          <label class="label text-ink-2" for="adjusterEmail">Adjuster Email</label>
          <input id="adjusterEmail" v-model="form.adjusterEmail" type="email" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-3 text-[15px] text-ink" />
        </div>
      </div>

      <!--
        Ironclad is paused (customer-facing): this section only appears for
        an account that already has an active subscription -- that's their
        existing entitlement, not new enrollment. Nothing invites someone
        without one to get Ironclad here anymore.
      -->
      <div v-if="hasActiveIronclad" class="border-t border-hairline pt-6">
        <label class="flex items-start gap-3 text-[15px] text-ink-2">
          <input
            v-model="form.ironcladSupportRequested"
            type="checkbox"
            class="mt-0.5 h-[18px] w-[18px] accent-[color:var(--color-signal)]"
          />
          Include this job in my Ironclad support (rebuttal help + guaranteed SLA)
        </label>
        <p class="mt-2 text-[13px] text-ink-2">
          Counts against your plan's monthly job/RCV limit. Once requested, you can't remove it yourself — you'd
          need to request a demotion for staff to review. The standard estimate fee above still applies either
          way.
        </p>
      </div>

      <button type="submit" class="btn btn-signal w-full" :disabled="status === 'submitting'">{{ submitLabel }}</button>

      <p v-if="status === 'free'" role="status" class="border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2">
        Request received — reference {{ lastId }}. This one's on us, no deposit needed.
      </p>
      <p v-if="status === 'consultation'" role="status" class="border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2">
        Request received — reference {{ lastId }}. We'll reach out to schedule a consultation and figure out next
        steps before any deposit is collected.
      </p>
      <p v-if="status === 'custom'" role="status" class="border-l-4 border-rust bg-inset px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2">
        Request received — reference {{ lastId }}. Since this is a custom-tier loss, we'll reach out directly to
        arrange the deposit.
      </p>
      <p v-if="status === 'error'" role="alert" class="text-[14.5px] font-medium text-rust">{{ errorMsg }}</p>
    </form>
  </section>
</template>

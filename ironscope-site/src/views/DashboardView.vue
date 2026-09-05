<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import { useSession } from '@/composables/useSession'
import { getTierById } from '@/lib/ironcladTiers'

const route = useRoute()
const { user } = useSession()

const requests = ref([])
const loading = ref(true)
const ironcladUsage = ref(null)
const actionError = ref('')

const upgradingId = ref(null)
const payingId = ref(null)
const requestingSupportId = ref(null)
const requestingDemotionId = ref(null)
const approvalFormId = ref(null)
const approvalRcv = ref('')
const approvalProofLink = ref('')
const submittingApprovalId = ref(null)

const depositJustPaid = route.query.deposit === 'paid'
const ironcladJustPaid = route.query.ironclad === 'paid'

const freeRemaining = computed(() => (user.value ? Math.max(0, 3 - (user.value.freeEstimatesUsed || 0)) : null))
const hasActiveIronclad = computed(
  () => user.value?.subscriptionStatus === 'active' && Boolean(user.value?.ironcladTier)
)

async function load() {
  loading.value = true
  const data = await api.get('/api/requests')
  requests.value = data.requests || []
  loading.value = false
}

async function loadUsage() {
  try {
    const data = await api.get('/api/ironclad-usage')
    ironcladUsage.value = data.usage || null
  } catch {
    ironcladUsage.value = null
  }
}

onMounted(() => {
  load()
  loadUsage()
})

async function requestIroncladUpgrade(id) {
  upgradingId.value = id
  actionError.value = ''
  try {
    await api.post(`/api/requests/${id}/upgrade-ironclad`, {})
    await load()
  } catch (err) {
    actionError.value = err.message
  } finally {
    upgradingId.value = null
  }
}

async function payIroncladFee(id) {
  payingId.value = id
  actionError.value = ''
  try {
    const data = await api.post('/api/stripe/ironclad-fee-checkout', { requestId: id })
    window.location.href = data.url
  } catch (err) {
    actionError.value = err.message
    payingId.value = null
  }
}

async function requestIroncladSupportForJob(id) {
  requestingSupportId.value = id
  actionError.value = ''
  try {
    await api.post(`/api/requests/${id}/request-ironclad-support`, {})
    await load()
    await loadUsage()
  } catch (err) {
    actionError.value = err.message
  } finally {
    requestingSupportId.value = null
  }
}

async function requestIroncladDemotionForJob(id) {
  requestingDemotionId.value = id
  actionError.value = ''
  try {
    await api.post(`/api/requests/${id}/request-ironclad-demotion`, {})
    await load()
  } catch (err) {
    actionError.value = err.message
  } finally {
    requestingDemotionId.value = null
  }
}

function openApprovalForm(id) {
  approvalFormId.value = id
  approvalRcv.value = ''
  approvalProofLink.value = ''
  actionError.value = ''
}

async function submitApproval(id) {
  submittingApprovalId.value = id
  actionError.value = ''
  try {
    await api.post(`/api/requests/${id}/submit-approval`, {
      approvedRcv: approvalRcv.value,
      approvalProofLink: approvalProofLink.value,
    })
    approvalFormId.value = null
    await load()
  } catch (err) {
    actionError.value = err.message
  } finally {
    submittingApprovalId.value = null
  }
}

function canOfferUpgrade(r) {
  return r.isFreeEstimate && ['DELIVERED', 'REVISION_REQUESTED'].includes(r.status) && !r.ironcladUpgradeRequested
}
function canReportApproval(r) {
  return ['DELIVERED', 'REVISION_REQUESTED', 'APPROVED'].includes(r.status) && !r.approvedRcv
}
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">Your Account</p>
    <h1 class="display-2 mt-4 text-ink">My Requests</h1>
    <p class="lede mt-4 text-ink-2">Everything you've submitted, and where it stands.</p>

    <div v-if="!ironcladUsage" class="mt-8 flex flex-wrap items-center justify-between gap-4 border-l-4 border-rust bg-inset px-5 py-4">
      <span class="text-[15px] text-ink-2">
        Want rebuttal support and a guaranteed SLA on your jobs? Ironclad subscriptions start at $99/mo.
      </span>
      <div class="flex shrink-0 gap-3">
        <RouterLink to="/pricing" class="btn btn-outline">View Pricing</RouterLink>
        <RouterLink to="/upgrade" class="btn btn-outline">Upgrade to Ironclad</RouterLink>
      </div>
    </div>

    <div v-else class="mt-8 rounded-card border-2 border-rule bg-carbon p-6 text-on-dark">
      <div class="flex items-center justify-between gap-4">
        <span class="label text-signal">Ironclad · {{ ironcladUsage.tier.name }}</span>
        <div class="flex gap-4 text-[12px]">
          <RouterLink to="/pricing" class="text-on-dark-muted hover:text-on-dark">Pricing →</RouterLink>
          <RouterLink to="/upgrade" class="text-on-dark-muted hover:text-on-dark">Manage plan →</RouterLink>
        </div>
      </div>
      <p class="mt-3 text-[13px] leading-relaxed text-on-dark-muted">
        Ironclad support (rebuttal help + guaranteed SLA) covers up to this many jobs and this much RCV per month.
        Standard estimate-writing fees still apply to every job, Ironclad or not.
      </p>
      <div class="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <span class="label text-on-dark-muted">Jobs with Ironclad support this month</span>
          <p class="figure mt-1 text-[22px] text-on-dark">{{ ironcladUsage.jobsRequested }} / {{ ironcladUsage.jobsIncluded }}</p>
        </div>
        <div>
          <span class="label text-on-dark-muted">RCV covered this month</span>
          <p class="mt-1 text-[15px] text-on-dark">
            ${{ ironcladUsage.rcvConfirmed.toLocaleString() }} confirmed
            <template v-if="ironcladUsage.rcvPending > 0"> · ${{ ironcladUsage.rcvPending.toLocaleString() }} pending</template>
          </p>
        </div>
      </div>
      <p v-if="ironcladUsage.pendingOverWarningThreshold" class="mt-5 border-l-4 border-signal bg-on-dark-rule/40 px-4 py-3 text-[13px] leading-relaxed text-on-dark">
        Your pending (unconfirmed) RCV is well over your ${{ ironcladUsage.volumeCeiling.toLocaleString() }} monthly
        limit. Jobs confirmed past that limit won't have Ironclad support — estimate only — until your
        subscription renews or you upgrade tiers.
      </p>
    </div>

    <div v-if="depositJustPaid" class="mt-6 border-l-4 border-rust bg-inset px-5 py-4 text-[15px] text-ink-2">
      Deposit received — your request below is marked paid.
    </div>
    <div v-if="ironcladJustPaid" class="mt-6 border-l-4 border-rust bg-inset px-5 py-4 text-[15px] text-ink-2">
      Payment received — Ironclad support is now active on that request.
    </div>
    <div v-if="freeRemaining !== null && freeRemaining > 0 && requests.length === 0" class="mt-6 border-l-4 border-rust bg-inset px-5 py-4 text-[15px] leading-relaxed text-ink-2">
      You have <strong>{{ freeRemaining }} free estimate{{ freeRemaining === 1 ? '' : 's' }}</strong> waiting to be
      used — small estimates under $10,000 don't cost anything for your first three. Free estimates are the
      estimate itself only; revisions and Ironclad-level support aren't included, though you can add Ironclad
      after the fact if a carrier pushes back.
    </div>
    <p v-if="actionError" role="alert" class="mt-6 text-[14.5px] font-medium text-rust">{{ actionError }}</p>

    <div v-if="loading" class="mt-12 text-[15px] text-ink-2">Loading...</div>

    <div v-else-if="requests.length === 0" class="mt-12 rounded-card border-2 border-dashed border-rule px-8 py-14 text-center">
      <p class="display-3 text-ink">No active submissions</p>
      <p class="mt-3 text-[15px] text-ink-2">
        Ready when you are — submitting takes a few minutes and we'll take it from there.
      </p>
      <RouterLink to="/intake" class="btn btn-signal mt-6 inline-flex">Start an Estimate</RouterLink>
    </div>

    <div v-else class="mt-10 space-y-6">
      <div v-for="r in requests" :key="r.id" class="rounded-card border-2 border-rule bg-surface p-6">
        <div class="flex items-start justify-between gap-6">
          <div>
            <p class="label text-muted">{{ r.id }}</p>
            <p class="display-3 mt-1 text-ink">{{ r.lossType }} — {{ r.propertyAddress }}</p>
            <dl class="mt-4 space-y-1.5 text-[14px] text-ink-2">
              <div><span class="font-semibold text-ink">Carrier</span> {{ r.carrierName || '—' }} · <span class="font-semibold text-ink">Claim #</span> {{ r.claimNumber || '—' }}</div>
              <div>
                <span class="font-semibold text-ink">Est. RCV</span>
                <span v-if="r.estimatedRcv">
                  ${{ Number(r.estimatedRcv).toLocaleString() }}<template v-if="!r.approvedRcv"> (unconfirmed)</template>
                </span>
                <span v-else>—</span>
                ·
                <span class="font-semibold text-ink">Deposit</span>
                <span v-if="r.isFreeEstimate">Free</span>
                <span v-else-if="r.depositPaid">Paid<template v-if="r.depositAmountCents"> (${{ (r.depositAmountCents / 100).toFixed(0) }})</template></span>
                <span v-else class="font-semibold text-rust">Pending</span>
              </div>
              <div v-if="r.approvedRcv"><span class="font-semibold text-ink">Approved RCV</span> ${{ Number(r.approvedRcv).toLocaleString() }}</div>
              <div v-else-if="r.customerReportedApprovedRcv"><span class="font-semibold text-ink">Approved RCV</span> ${{ Number(r.customerReportedApprovedRcv).toLocaleString() }} reported — pending confirmation</div>
              <div v-if="r.ironcladUpgradeFeeCents && r.ironcladUpgradeFeePaid"><span class="font-semibold text-ink">Ironclad</span> Active — ${{ (r.ironcladUpgradeFeeCents / 100).toFixed(2) }} paid</div>
              <div v-if="r.ironcladSupportRequested && r.approvedRcv && !r.ironcladCoverageExcluded"><span class="font-semibold text-ink">Ironclad</span> Support requested — covered by your plan</div>
              <div v-if="r.ironcladSupportRequested && r.approvedRcv && r.ironcladCoverageExcluded" class="text-rust">Requested, but over your plan's limit — estimate only, no rebuttal support or guaranteed SLA on this job</div>
              <div v-if="r.ironcladSupportRequested && !r.approvedRcv">Support requested — coverage isn't final until this job's RCV is confirmed</div>
              <div v-if="r.ironcladDemotionRequested" class="text-muted">Demotion to standard requested — pending staff review</div>
            </dl>
          </div>
          <span class="label shrink-0 rounded-full border border-rule px-3 py-1.5 text-ink-2">{{ r.status.replace('_', ' ') }}</span>
        </div>

        <div class="mt-5 flex flex-wrap gap-3 border-t border-hairline pt-5">
          <button v-if="hasActiveIronclad && !r.ironcladSupportRequested" class="btn btn-outline" :disabled="requestingSupportId === r.id" @click="requestIroncladSupportForJob(r.id)">
            {{ requestingSupportId === r.id ? 'Requesting...' : 'Request Ironclad Support' }}
          </button>
          <button v-if="r.ironcladSupportRequested && !r.ironcladDemotionRequested" class="btn btn-outline" :disabled="requestingDemotionId === r.id" @click="requestIroncladDemotionForJob(r.id)">
            {{ requestingDemotionId === r.id ? 'Requesting...' : 'Request Demotion to Standard' }}
          </button>

          <div v-if="canOfferUpgrade(r)" class="w-full space-y-2">
            <p class="text-[13px] text-ink-2">
              Carrier pushing back on this one? Upgrade to Ironclad for a full rebuttal package. You'll only owe
              the standard estimate fee, based on the final approved value — no deposit required.
            </p>
            <button class="btn btn-outline" :disabled="upgradingId === r.id" @click="requestIroncladUpgrade(r.id)">
              {{ upgradingId === r.id ? 'Requesting...' : 'Upgrade to Ironclad' }}
            </button>
          </div>

          <p v-if="r.ironcladUpgradeRequested && !r.ironcladUpgradeFeeCents" class="text-[13px] text-ink-2">
            Ironclad upgrade requested — the fee will be calculated once your estimate is approved and the final
            RCV is confirmed.
          </p>

          <div v-if="r.ironcladUpgradeFeeCents && !r.ironcladUpgradeFeePaid" class="w-full space-y-2">
            <p class="text-[13px] text-ink-2">Approved — Ironclad fee due: <strong>${{ (r.ironcladUpgradeFeeCents / 100).toFixed(2) }}</strong></p>
            <button class="btn btn-signal" :disabled="payingId === r.id" @click="payIroncladFee(r.id)">
              {{ payingId === r.id ? 'Redirecting to checkout...' : 'Pay Now' }}
            </button>
          </div>

          <template v-if="canReportApproval(r)">
            <button v-if="approvalFormId !== r.id" class="btn btn-outline" @click="openApprovalForm(r.id)">
              {{ r.customerReportedApprovedRcv ? 'Update Approved RCV' : 'Report Approved RCV' }}
            </button>
            <div v-else class="w-full space-y-3">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="label text-ink-2">Approved RCV ($)</label>
                  <input v-model="approvalRcv" type="number" min="0" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-2.5 text-[15px] text-ink" />
                </div>
                <div>
                  <label class="label text-ink-2">Proof link</label>
                  <input v-model="approvalProofLink" type="url" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-2.5 text-[15px] text-ink" />
                </div>
              </div>
              <div class="flex gap-3">
                <button class="btn btn-signal" :disabled="submittingApprovalId === r.id" @click="submitApproval(r.id)">
                  {{ submittingApprovalId === r.id ? 'Submitting...' : 'Submit' }}
                </button>
                <button class="btn btn-outline" @click="approvalFormId = null">Cancel</button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

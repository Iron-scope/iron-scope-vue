<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'

const STATUS_FLOW = {
  SUBMITTED: 'IN_PROGRESS',
  IN_PROGRESS: 'DELIVERED',
  DELIVERED: 'APPROVED',
  APPROVED: null,
}
const NEXT_LABEL = { SUBMITTED: 'Claim', IN_PROGRESS: 'Mark Delivered' }
const FILTERS = ['ALL', 'SUBMITTED', 'IN_PROGRESS', 'AWAITING_INFO', 'REVISION_REQUESTED', 'DELIVERED', 'APPROVED']

const route = useRoute()
const requests = ref([])
const loading = ref(true)
const filter = ref('ALL')
const approvingId = ref(null)
const approvedRcv = ref('')
const approvalProofLink = ref('')
const approvalError = ref('')
const ironcladOverridingId = ref(null)

const depositJustPaid = route.query.deposit === 'paid'

async function load() {
  loading.value = true
  const data = await api.get('/api/requests')
  requests.value = data.requests
  loading.value = false
}
onMounted(load)

async function advance(id, current) {
  const next = STATUS_FLOW[current]
  if (!next || next === 'APPROVED') return
  await api.patch(`/api/requests/${id}`, { status: next })
  load()
}
async function setStatus(id, status) {
  await api.patch(`/api/requests/${id}`, { status })
  load()
}
async function setIroncladOverride(id, requested) {
  ironcladOverridingId.value = id
  try {
    await api.post(`/api/requests/${id}/ironclad-override`, { requested })
    await load()
  } finally {
    ironcladOverridingId.value = null
  }
}
function startApproval(id) {
  approvingId.value = id
  const record = requests.value.find((r) => r.id === id)
  approvedRcv.value = record?.customerReportedApprovedRcv ? String(record.customerReportedApprovedRcv) : ''
  approvalProofLink.value = record?.customerReportedApprovalProofLink || ''
  approvalError.value = ''
}
async function confirmApproval(id) {
  if (!approvedRcv.value || !approvalProofLink.value) {
    approvalError.value = "Both the approved RCV and a link to the carrier's approval documentation are required."
    return
  }
  await api.patch(`/api/requests/${id}`, {
    status: 'APPROVED',
    approvedRcv: Number(approvedRcv.value),
    approvalProofLink: approvalProofLink.value,
  })
  approvingId.value = null
  load()
}

const filtered = computed(() => (filter.value === 'ALL' ? requests.value : requests.value.filter((r) => r.status === filter.value)))
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">Internal</p>
    <h1 class="display-2 mt-4 text-ink">Queue</h1>
    <p class="lede mt-4 text-ink-2">Everything coming in, sorted newest first.</p>

    <div v-if="depositJustPaid" class="mt-6 border-l-4 border-rust bg-inset px-5 py-4 text-[15px] text-ink-2">
      Deposit received — the request below is marked paid.
    </div>

    <div class="mt-8 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in FILTERS"
          :key="s"
          class="btn btn-outline"
          :class="filter === s ? 'border-ink text-ink' : ''"
          @click="filter = s"
        >
          {{ s.replace('_', ' ') }}
        </button>
      </div>
      <span class="label rounded-full border border-rule px-3 py-1.5 text-ink-2">{{ filtered.length }} request(s)</span>
    </div>

    <div v-if="loading" class="mt-12 text-[15px] text-ink-2">Loading...</div>
    <p v-else-if="filtered.length === 0" class="mt-12 text-[15px] text-ink-2">No requests here yet.</p>

    <div v-else class="mt-10 space-y-6">
      <div v-for="r in filtered" :key="r.id" class="rounded-card border-2 border-rule bg-surface p-6">
        <div class="flex items-start justify-between gap-6">
          <div>
            <p class="label text-muted">{{ r.id }}</p>
            <p class="display-3 mt-1 text-ink">{{ r.companyName }}</p>
            <p v-if="r.internalStatus" class="mt-1 text-[13px] font-semibold text-rust">Internal: {{ r.internalStatus }}</p>
            <dl class="mt-3 space-y-1.5 text-[14px] text-ink-2">
              <div><span class="font-semibold text-ink">Submitted</span> {{ r.createdAt ? new Date(r.createdAt).toLocaleString() : '—' }}</div>
              <div><span class="font-semibold text-ink">Loss</span> {{ r.lossType }} · <span class="font-semibold text-ink">Turnaround</span> {{ r.turnaround }}</div>
              <div><span class="font-semibold text-ink">Address</span> {{ r.propertyAddress }}</div>
              <div><span class="font-semibold text-ink">Carrier</span> {{ r.carrierName || '—' }} · <span class="font-semibold text-ink">Claim #</span> {{ r.claimNumber || '—' }}</div>
              <div><span class="font-semibold text-ink">Contact</span> {{ r.contactName }}<template v-if="r.contactPhone"> · {{ r.contactPhone }}</template></div>
              <div v-if="r.adjusterName || r.adjusterPhone || r.adjusterEmail">
                <span class="font-semibold text-ink">Adjuster</span> {{ r.adjusterName || '—' }}<template v-if="r.adjusterPhone"> · {{ r.adjusterPhone }}</template><template v-if="r.adjusterEmail"> · {{ r.adjusterEmail }}</template>
              </div>
              <div>
                <span class="font-semibold text-ink">Est. RCV</span>
                <span v-if="r.needsConsultation" class="font-semibold text-rust">Needs consultation</span>
                <span v-else-if="r.estimatedRcv">${{ Number(r.estimatedRcv).toLocaleString() }}</span>
                <span v-else>—</span>
                ·
                <span class="font-semibold text-ink">Deposit</span>
                <span v-if="r.depositPaid">Paid<template v-if="r.depositAmountCents"> (${{ (r.depositAmountCents / 100).toFixed(0) }})</template></span>
                <span v-else class="font-semibold text-rust">Pending</span>
              </div>
              <div v-if="r.approvedRcv">
                <span class="font-semibold text-ink">Approved RCV</span> ${{ Number(r.approvedRcv).toLocaleString() }}
                <a v-if="r.approvalProofLink" :href="r.approvalProofLink" target="_blank" rel="noopener noreferrer" class="ml-1 underline">Proof ↗</a>
              </div>
              <div v-else-if="r.customerReportedApprovedRcv">
                <span class="font-semibold text-ink">Reported RCV</span> ${{ Number(r.customerReportedApprovedRcv).toLocaleString() }} — needs verification
                <a v-if="r.customerReportedApprovalProofLink" :href="r.customerReportedApprovalProofLink" target="_blank" rel="noopener noreferrer" class="ml-1 underline">Proof ↗</a>
              </div>
              <div v-if="r.ironcladUpgradeRequested">
                <span class="font-semibold text-ink">Ironclad Upgrade</span>
                <span v-if="r.ironcladUpgradeFeePaid">Paid — ${{ (r.ironcladUpgradeFeeCents / 100).toFixed(2) }}</span>
                <span v-else-if="r.ironcladUpgradeFeeCents" class="font-semibold text-rust">Fee due — ${{ (r.ironcladUpgradeFeeCents / 100).toFixed(2) }}</span>
                <span v-else>Requested — awaiting approval to calculate fee</span>
              </div>
              <div v-if="r.ironcladSupportRequested">
                <span class="font-semibold text-ink">Ironclad Sub</span>
                <span v-if="!r.approvedRcv">Requested — coverage not final until RCV is confirmed</span>
                <span v-else-if="r.ironcladCoverageExcluded" class="font-semibold text-rust">Requested — over plan limit, estimate only</span>
                <span v-else>Requested — covered</span>
              </div>
              <div v-if="r.documentationLinks || r.scanLink" class="flex flex-wrap gap-3 pt-1">
                <a
                  v-for="(link, i) in (r.documentationLinks || '').split('\n').map((l) => l.trim()).filter(Boolean)"
                  :key="`doc-${i}`"
                  :href="link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline"
                >
                  Photos/Video {{ i + 1 }} ↗
                </a>
                <a v-if="r.scanLink" :href="r.scanLink" target="_blank" rel="noopener noreferrer" class="underline">3D Scan ↗</a>
              </div>
            </dl>
          </div>
          <span class="label shrink-0 rounded-full border border-rule px-3 py-1.5 text-ink-2">{{ r.status.replace('_', ' ') }}</span>
        </div>

        <div v-if="r.ironcladDemotionRequested" class="mt-5 space-y-3 border-t border-hairline pt-5">
          <p class="text-[13px] font-semibold text-rust">
            Contractor requested demoting this job to standard (removing Ironclad support). Review and decide:
          </p>
          <div class="flex gap-3">
            <button class="btn btn-outline" :disabled="ironcladOverridingId === r.id" @click="setIroncladOverride(r.id, false)">
              {{ ironcladOverridingId === r.id ? 'Working...' : 'Approve — Remove Ironclad Support' }}
            </button>
            <button class="btn btn-outline" :disabled="ironcladOverridingId === r.id" @click="setIroncladOverride(r.id, true)">
              {{ ironcladOverridingId === r.id ? 'Working...' : 'Deny — Keep Support' }}
            </button>
          </div>
        </div>
        <div v-else-if="r.ironcladSupportRequested" class="mt-5 border-t border-hairline pt-5">
          <button class="btn btn-outline" :disabled="ironcladOverridingId === r.id" @click="setIroncladOverride(r.id, false)">
            {{ ironcladOverridingId === r.id ? 'Working...' : 'Override: Remove Ironclad Support' }}
          </button>
        </div>
        <div v-else class="mt-5 border-t border-hairline pt-5">
          <button class="btn btn-outline" :disabled="ironcladOverridingId === r.id" @click="setIroncladOverride(r.id, true)">
            {{ ironcladOverridingId === r.id ? 'Working...' : 'Override: Add Ironclad Support' }}
          </button>
        </div>

        <div v-if="r.status === 'SUBMITTED' || r.status === 'IN_PROGRESS'" class="mt-3">
          <button class="btn btn-signal" @click="advance(r.id, r.status)">{{ NEXT_LABEL[r.status] }}</button>
        </div>

        <div v-if="r.status === 'AWAITING_INFO' || r.status === 'REVISION_REQUESTED'" class="mt-3">
          <button class="btn btn-outline" @click="setStatus(r.id, 'IN_PROGRESS')">Back to In Progress</button>
        </div>

        <div v-if="r.status === 'DELIVERED' && approvingId !== r.id" class="mt-3">
          <button class="btn btn-outline" @click="startApproval(r.id)">Mark Approved</button>
        </div>

        <div v-if="r.status === 'DELIVERED' && approvingId === r.id" class="mt-5 space-y-3 border-t border-hairline pt-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label text-ink-2">Approved RCV ($)</label>
              <input v-model="approvedRcv" type="number" min="0" placeholder="Final carrier-approved value" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-2.5 text-[15px] text-ink" />
            </div>
            <div>
              <label class="label text-ink-2">Approval Proof Link</label>
              <input v-model="approvalProofLink" placeholder="Link to approval letter, EOR, or approved summary" class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-2.5 text-[15px] text-ink" />
            </div>
          </div>
          <p v-if="approvalError" role="alert" class="text-[14px] font-medium text-rust">{{ approvalError }}</p>
          <div class="flex gap-3">
            <button class="btn btn-signal" @click="confirmApproval(r.id)">Confirm Approval</button>
            <button class="btn btn-outline" @click="approvingId = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

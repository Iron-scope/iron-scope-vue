<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/lib/api'
import { getTierById } from '@/lib/ironcladTiers'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const users = ref([])
const loading = ref(true)
const actioningId = ref(null)
const actionError = ref('')

const search = ref('')
const pageSize = ref(PAGE_SIZE_OPTIONS[0])
const page = ref(1)

async function load() {
  loading.value = true
  const data = await api.get('/api/admin/users')
  users.value = data.users || []
  loading.value = false
}

onMounted(load)

async function runAction(id, action, confirmMessage) {
  if (confirmMessage && !window.confirm(confirmMessage)) return
  actioningId.value = `${id}:${action}`
  actionError.value = ''
  try {
    await api.patch(`/api/admin/users/${id}`, { action })
    await load()
  } catch (err) {
    actionError.value = err.message
  } finally {
    actioningId.value = null
  }
}

const activeUsers = computed(() => users.value.filter((u) => !u.deactivated))
const blacklistedUsers = computed(() => users.value.filter((u) => u.deactivated))

const filteredActiveUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = !q
    ? activeUsers.value
    : activeUsers.value.filter((u) => {
        const company = (u.companyName || '').toLowerCase()
        const email = (u.email || '').toLowerCase()
        return company.includes(q) || email.includes(q)
      })
  return [...list].sort((a, b) => (a.companyName || a.email || '').localeCompare(b.companyName || b.email || ''))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredActiveUsers.value.length / pageSize.value)))
const currentPage = computed(() => Math.min(page.value, totalPages.value))
const pagedActiveUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredActiveUsers.value.slice(start, start + pageSize.value)
})

function handleSearchChange(value) {
  search.value = value
  page.value = 1
}
function handlePageSizeChange(value) {
  pageSize.value = Number(value)
  page.value = 1
}

function isBusy(id, action) {
  return actioningId.value === `${id}:${action}`
}
function tierFor(u) {
  return u.ironcladTier ? getTierById(u.ironcladTier) : null
}
</script>

<template>
  <section class="shell py-16 md:py-20">
    <p class="label text-rust">Staff Only</p>
    <h1 class="display-2 mt-4 text-ink">User Accounts</h1>
    <p class="lede mt-4 max-w-2xl text-ink-2">Every account on the platform — suspend access, force a password reset, or manage billing.</p>

    <p v-if="actionError" role="alert" class="mt-6 text-[14.5px] font-medium text-rust">{{ actionError }}</p>
    <div v-if="loading" class="mt-12 text-[15px] text-ink-2">Loading...</div>

    <template v-else>
      <div class="mt-8 max-w-sm">
        <label class="label text-ink-2" for="user-search">Search by company or email</label>
        <input
          id="user-search"
          type="text"
          placeholder="e.g. Acme Restoration"
          :value="search"
          class="mt-2 w-full rounded-card border-2 border-rule bg-surface px-4 py-2.5 text-[15px] text-ink"
          @input="handleSearchChange($event.target.value)"
        />
      </div>

      <p v-if="filteredActiveUsers.length === 0" class="mt-10 text-[15px] text-ink-2">No matching accounts.</p>

      <div v-else class="mt-8 space-y-5">
        <div v-for="u in pagedActiveUsers" :key="u.id" class="rounded-card border-2 border-rule bg-surface p-6">
          <p class="label text-muted">{{ u.id }}</p>
          <p class="display-3 mt-1 text-ink">
            {{ u.email }} <span v-if="u.role === 'staff'" class="text-rust">· Staff</span>
          </p>
          <dl class="mt-3 space-y-1.5 text-[14px] text-ink-2">
            <div><span class="font-semibold text-ink">Company</span> {{ u.companyName || '—' }} · <span class="font-semibold text-ink">Contact</span> {{ u.contactName || '—' }}<template v-if="u.contactPhone"> ({{ u.contactPhone }})</template></div>
            <div><span class="font-semibold text-ink">Free Estimates Used</span> {{ u.freeEstimatesUsed || 0 }} / 3</div>
            <div>
              <span class="font-semibold text-ink">Ironclad</span>
              <span v-if="tierFor(u) && u.subscriptionStatus === 'active'">
                {{ tierFor(u).name }}<template v-if="u.subscriptionCancelAtPeriodEnd"> (canceling at period end)</template>
              </span>
              <span v-else class="text-muted">None</span>
            </div>
            <div v-if="u.submitAccessSuspended" class="font-semibold text-rust">Submit Access: Suspended</div>
            <div v-if="u.ironcladAccessSuspended" class="font-semibold text-rust">Ironclad Access: Suspended</div>
            <div v-if="u.passwordResetRequired" class="font-semibold text-rust">Password: Reset pending</div>
          </dl>

          <div class="mt-5 flex flex-wrap gap-3 border-t border-hairline pt-5">
            <button class="btn btn-outline" :disabled="isBusy(u.id, 'toggleSubmitAccess')" @click="runAction(u.id, 'toggleSubmitAccess')">
              {{ u.submitAccessSuspended ? 'Resume Submit Access' : 'Suspend Submit Access' }}
            </button>
            <button class="btn btn-outline" :disabled="isBusy(u.id, 'toggleIroncladAccess')" @click="runAction(u.id, 'toggleIroncladAccess')">
              {{ u.ironcladAccessSuspended ? 'Resume Ironclad Access' : 'Suspend Ironclad Access' }}
            </button>
            <button
              v-if="u.hasPassword && !u.passwordResetRequired"
              class="btn btn-outline"
              :disabled="isBusy(u.id, 'forcePasswordReset')"
              @click="runAction(u.id, 'forcePasswordReset', `Force a password reset for ${u.email}? They'll be locked out until they use the emailed link.`)"
            >
              {{ isBusy(u.id, 'forcePasswordReset') ? 'Sending...' : 'Force Password Reset' }}
            </button>
            <button
              v-if="tierFor(u) && u.subscriptionStatus === 'active' && !u.subscriptionCancelAtPeriodEnd"
              class="btn btn-outline"
              :disabled="isBusy(u.id, 'cancelSubscription')"
              @click="runAction(u.id, 'cancelSubscription', `Cancel ${u.email}'s Ironclad subscription at the end of the current billing period?`)"
            >
              {{ isBusy(u.id, 'cancelSubscription') ? 'Canceling...' : 'Cancel Subscription' }}
            </button>
            <a v-if="u.stripeCustomerId" :href="`https://dashboard.stripe.com/customers/${u.stripeCustomerId}`" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
              View in Stripe ↗
            </a>
            <button
              class="btn border-rust text-rust"
              :disabled="isBusy(u.id, 'deactivateAccount')"
              @click="runAction(u.id, 'deactivateAccount', `Deactivate ${u.email}? They'll be signed out and unable to log in until a staff member reactivates the account.`)"
            >
              {{ isBusy(u.id, 'deactivateAccount') ? 'Deactivating...' : 'Deactivate Account' }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <label class="label text-ink-2" for="page-size">Per page</label>
          <select id="page-size" :value="pageSize" class="mt-2 rounded-card border-2 border-rule bg-surface px-3 py-2 text-[14px] text-ink" @change="handlePageSizeChange($event.target.value)">
            <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn btn-outline" :disabled="currentPage <= 1" @click="page = Math.max(1, currentPage - 1)">Prev</button>
          <span class="text-[14px] text-ink-2">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn btn-outline" :disabled="currentPage >= totalPages" @click="page = Math.min(totalPages, currentPage + 1)">Next</button>
        </div>
      </div>

      <template v-if="blacklistedUsers.length > 0">
        <h2 class="display-3 mt-16 border-t border-hairline pt-10 text-ink">Blacklisted Accounts</h2>
        <p class="mt-2 text-[14px] text-ink-2">Deactivated accounts — locked out of login until reactivated.</p>
        <div class="mt-6 space-y-5">
          <div v-for="u in blacklistedUsers" :key="u.id" class="rounded-card border-2 border-rule bg-surface p-6">
            <p class="label text-muted">{{ u.id }}</p>
            <p class="display-3 mt-1 text-ink">{{ u.email }}</p>
            <dl class="mt-3 space-y-1.5 text-[14px] text-ink-2">
              <div><span class="font-semibold text-ink">Company</span> {{ u.companyName || '—' }} · <span class="font-semibold text-ink">Contact</span> {{ u.contactName || '—' }}</div>
              <div class="font-semibold text-rust">Deactivated: {{ u.deactivatedAt ? new Date(u.deactivatedAt).toLocaleString() : 'Yes' }}</div>
            </dl>
            <div class="mt-5 border-t border-hairline pt-5">
              <button class="btn btn-signal" :disabled="isBusy(u.id, 'reactivateAccount')" @click="runAction(u.id, 'reactivateAccount', `Reactivate ${u.email}? They'll be able to log in again immediately.`)">
                {{ isBusy(u.id, 'reactivateAccount') ? 'Reactivating...' : 'Reactivate Account' }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </template>
  </section>
</template>

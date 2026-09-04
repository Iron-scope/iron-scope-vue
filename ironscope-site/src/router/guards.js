import { useSession } from '@/composables/useSession'

/**
 * Direct port of mitigation-platform's middleware.js rule tables. Keep these
 * two arrays and the SITE_LOCKED flag in sync with that file by hand until
 * Phase 4 retires middleware.js entirely — this is deliberately a copy, not
 * a shared import, since the two apps are separate repos/deploys per the
 * migration plan.
 */
const SITE_LOCKED = false

const AUTH_REQUIRED_PATHS = ['/dashboard', '/intake', '/complete-profile', '/pricing']
const STAFF_ONLY_PATHS = ['/queue', '/admin']

function startsWithAny(path, prefixes) {
  return prefixes.some((p) => path.startsWith(p))
}

/**
 * IMPORTANT (noted in the migration plan, Phase 0): this guard is a UX
 * convenience, exactly like middleware.js is today — it stops the wrong page
 * from flashing before a redirect, it is NOT the real security boundary.
 * Every API route this app calls independently checks the session server-
 * side, so a user who bypasses this guard (dev tools, a stale build, etc.)
 * still can't do anything the API itself doesn't allow. The one known gap
 * (deactivated accounts aren't rechecked per-request by the API) is tracked
 * in the plan and must land before any real production cutover.
 */
export async function sessionGuard(to) {
  const { user, loaded, fetchSession } = useSession()

  if (!loaded.value) {
    await fetchSession()
  }

  const path = to.path

  if (SITE_LOCKED) {
    if (user.value?.role === 'staff') return true
    return path === '/coming-soon' ? true : { path: '/coming-soon' }
  }

  const needsAuth = startsWithAny(path, AUTH_REQUIRED_PATHS)
  const needsStaff = startsWithAny(path, STAFF_ONLY_PATHS)

  if (!needsAuth && !needsStaff) return true

  if (!user.value) {
    return { path: '/login', query: { callbackUrl: path } }
  }

  if (user.value.profileComplete === false && path !== '/complete-profile') {
    return { path: '/complete-profile' }
  }

  if (user.value.passwordResetRequired && path !== '/password-reset-required') {
    return { path: '/password-reset-required' }
  }

  if (user.value.deactivated && path !== '/contact') {
    return { path: '/contact' }
  }

  if (needsStaff && user.value.role !== 'staff') {
    return { path: '/dashboard' }
  }

  return true
}

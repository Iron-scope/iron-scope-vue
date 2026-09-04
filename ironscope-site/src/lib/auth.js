/**
 * Raw REST equivalent of next-auth/react's signIn() helper -- Vue has no
 * NextAuth client library, so this replicates exactly what that helper does
 * under the hood against the same, unchanged /api/auth/* endpoints:
 *
 *   1. GET /api/auth/csrf -- fetches a CSRF token and sets its paired cookie
 *      (double-submit pattern; same-origin via the dev proxy / production
 *      same-origin deploy, so the cookie rides along automatically).
 *   2. POST /api/auth/callback/credentials with that token, form-encoded
 *      (NextAuth's credentials callback expects x-www-form-urlencoded, not
 *      JSON) and json: "true", which makes it respond with { url } instead
 *      of doing a 302.
 *   3. If that url has an `error` query param, sign-in failed -- the value
 *      is whatever authorize() threw (e.g. "ACCOUNT_DEACTIVATED") or the
 *      generic "CredentialsSignin". No error param means success and the
 *      session cookie is now set.
 */
export async function signInCredentials(email, password) {
  const csrfRes = await fetch('/api/auth/csrf', { credentials: 'include' })
  const { csrfToken } = await csrfRes.json()

  const res = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken, email, password, json: 'true' }),
  })

  const data = await res.json().catch(() => null)
  if (!data?.url) return { error: 'No response from the server.' }

  const error = new URL(data.url).searchParams.get('error')
  return { error, url: data.url }
}

export function signInGoogle(callbackUrl = '/dashboard') {
  window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

export async function signOut() {
  const csrfRes = await fetch('/api/auth/csrf', { credentials: 'include' })
  const { csrfToken } = await csrfRes.json()
  await fetch('/api/auth/signout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken, json: 'true' }),
  })
}

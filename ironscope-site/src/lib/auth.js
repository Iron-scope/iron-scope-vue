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

/**
 * OAuth providers can't be initiated with a bare GET -- NextAuth's
 * /api/auth/signin/:provider route requires a POST carrying a valid CSRF
 * token (the same double-submit check as credentials sign-in), otherwise
 * it just falls through to re-rendering the configured sign-in page
 * (pages.signIn: "/login" here) instead of redirecting to Google. This is
 * exactly what next-auth/react's signIn() does under the hood for OAuth
 * providers: fetch a CSRF token, then a real <form> POST (not fetch --
 * the response is a 302 straight to Google, which only a real navigation
 * follows correctly).
 *
 * callbackUrl is resolved to an absolute, same-origin URL before sending
 * -- next-auth/react does the same. Passing a bare relative path through
 * unresolved is what caused the /dashboard 404 after a failed Google
 * attempt: NextAuth's own redirect-back-to-signin fallback returned an
 * *absolute* callbackUrl, and that string then got passed straight into
 * router.push() on the next login attempt, which read it as a literal
 * path (producing .../https://iron-scope.com/dashboard).
 */
export async function signInGoogle(callbackUrl = '/dashboard') {
  const absoluteCallbackUrl = new URL(callbackUrl, window.location.origin).toString()

  const csrfRes = await fetch('/api/auth/csrf', { credentials: 'include' })
  const { csrfToken } = await csrfRes.json()

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = '/api/auth/signin/google'

  for (const [name, value] of Object.entries({ csrfToken, callbackUrl: absoluteCallbackUrl })) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
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

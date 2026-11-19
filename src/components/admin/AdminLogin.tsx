import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound, Leaf, LoaderCircle, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Wrong email or password. Please try again.'
            : signInError.message,
        )
      }
    } catch {
      setError('Could not reach the sign-in service. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin admin-auth">
      <div className="admin-auth-card">
        <span className="admin-auth-seal" aria-hidden="true">
          <Leaf />
        </span>
        <p className="eyebrow">Leaf &amp; Kettle</p>
        <h1>Shop control panel</h1>
        <p className="admin-auth-lede">
          Sign in with the shop owner account to see customer orders, delivery
          addresses, and payment status.
        </p>

        <form className="admin-auth-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <div className="form-alert" role="alert">
              <Lock aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoaderCircle className="spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              <>
                <KeyRound aria-hidden="true" />
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="admin-auth-note">
          Only the shop owner account can read orders. Customer details are
          protected by database row-level security.
        </p>

        <Link className="admin-auth-back-link" to="/">
          <ArrowLeft aria-hidden="true" />
          Back to the shop
        </Link>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Database,
  KeyRound,
  Lock,
  Send,
} from 'lucide-react'
import { BrandMark } from '../BrandMark'

export function AdminSetup() {
  return (
    <div className="admin admin-auth">
      <div className="admin-auth-card admin-setup">
        <span className="admin-auth-seal" aria-hidden="true">
          <BrandMark />
        </span>
        <p className="eyebrow">Cha Ghor</p>
        <h1>Connect your control panel</h1>
        <p className="admin-auth-lede">
          The storefront is ready, but orders need a Supabase database and a
          Telegram bot before the control panel can work.
        </p>

        <ol className="admin-setup-steps">
          <li>
            <Database aria-hidden="true" />
            <span>Create a free Supabase project.</span>
          </li>
          <li>
            <Database aria-hidden="true" />
            <span>
              Run <code>supabase/schema.sql</code> in the Supabase SQL editor.
            </span>
          </li>
          <li>
            <Lock aria-hidden="true" />
            <span>
              Add your admin user under Authentication → Users, allow it in{' '}
              <code>public.admin_users</code> (see the setup guide), then disable
              new sign-ups.
            </span>
          </li>
          <li>
            <Send aria-hidden="true" />
            <span>
              Create a Telegram bot with @BotFather and copy its token and your
              chat ID.
            </span>
          </li>
          <li>
            <KeyRound aria-hidden="true" />
            <span>
              Add the environment variables from <code>.env.example</code> to
              Vercel (and <code>.env.local</code> for local development).
            </span>
          </li>
        </ol>

        <p className="admin-setup-note">
          See <code>ADMIN_SETUP.md</code> in the repository for the full
          walkthrough. Redeploy after adding the keys, then reload this page.
        </p>

        <Link className="btn btn-secondary btn-large admin-auth-back" to="/">
          <ArrowLeft aria-hidden="true" />
          Back to the shop
        </Link>
      </div>
    </div>
  )
}

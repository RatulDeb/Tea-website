import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LoaderCircle } from 'lucide-react'
import { AdminDashboard } from '../components/admin/AdminDashboard'
import { AdminLogin } from '../components/admin/AdminLogin'
import { AdminSetup } from '../components/admin/AdminSetup'
import { usePageTitle } from '../hooks/usePageTitle'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(isSupabaseConfigured)

  usePageTitle('Shop control panel')

  useEffect(() => {
    if (!supabase) return

    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session)
        setChecking(false)
      })
      .catch(() => {
        if (!active) return
        setSession(null)
        setChecking(false)
      })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setChecking(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  if (!isSupabaseConfigured) {
    return <AdminSetup />
  }

  if (checking) {
    return (
      <div className="admin admin-auth">
        <div className="admin-loading" role="status">
          <LoaderCircle className="spin" aria-hidden="true" />
          <p>Checking your session…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AdminLogin />
  }

  return <AdminDashboard session={session} />
}

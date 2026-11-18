import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <section className="section shell narrow">
      <div className="empty-state">
        <span className="empty-icon" aria-hidden="true">
          <Leaf />
        </span>
        <p className="eyebrow">404</p>
        <h1>This page has gone cold.</h1>
        <p>We could not find the page you were looking for. Try the tea shelf.</p>
        <Link className="btn btn-primary" to="/">
          Return to the shop
        </Link>
      </div>
    </section>
  )
}

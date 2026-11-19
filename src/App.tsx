import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { Layout } from './components/Layout'
import { ShopPage } from './pages/ShopPage'
import { TeaInfoPage } from './pages/TeaInfoPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { CreditsPage } from './pages/CreditsPage'
import { NotFoundPage } from './pages/NotFoundPage'

const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })),
)

export default function App() {
  return (
    <Routes>
      <Route
        path="admin"
        element={
          <Suspense
            fallback={
              <div className="admin admin-auth">
                <div className="admin-loading" role="status">
                  <LoaderCircle className="spin" aria-hidden="true" />
                  <p>Loading control panel…</p>
                </div>
              </div>
            }
          >
            <AdminPage />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<ShopPage />} />
        <Route path="teas" element={<TeaInfoPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="credits" element={<CreditsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

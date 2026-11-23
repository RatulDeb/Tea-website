import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { BrandMark } from './BrandMark'
import { siteConfig } from '../data/site'
import { formatMoney } from '../lib/money'
import { useCart } from '../hooks/useCart'

const navItems = [
  { to: '/', label: 'Shop', end: true },
  { to: '/teas', label: 'Our Teas & Services', end: false },
]

export function Header() {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)


  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const cartLabel = `${count} ${count === 1 ? 'item' : 'items'} in cart`
  const badgeValue = count > 99 ? '99+' : String(count)

  return (
    <>
      <div className="announcement">
        <div className="shell announcement-inner">
          <span>Demo store — no real payments are processed</span>
          <Link to="/teas#shipping-details">
            Free shipping on {formatMoney(siteConfig.shipping.freeThresholdCents)}+
          </Link>
        </div>
      </div>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="brand" to="/" aria-label={`${siteConfig.brand} home`}>
            <span className="brand-seal" aria-hidden="true">
              <BrandMark />
            </span>
            <span className="brand-text">
              <span className="brand-name">{siteConfig.brand}</span>
              <span className="brand-tagline">{siteConfig.tagline}</span>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <Link className="cart-button" to="/cart" aria-label={cartLabel}>
              <ShoppingBag aria-hidden="true" />
              <span className="cart-button-text">Cart</span>
              <span className="cart-badge" aria-hidden="true">
                {badgeValue}
              </span>
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile">
            <div className="shell mobile-nav-inner">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                }
                onClick={() => setMenuOpen(false)}
              >
                Cart ({count})
              </NavLink>
              <NavLink
                to="/credits"
                className={({ isActive }) =>
                  isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                }
                onClick={() => setMenuOpen(false)}
              >
                Image credits
              </NavLink>
            </div>
          </nav>
        ) : null}
      </header>
    </>
  )
}



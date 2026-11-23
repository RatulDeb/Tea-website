import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { BrandMark } from './BrandMark'
import { siteConfig } from '../data/site'
import { formatAddress, gmailComposeUrl, googleMapsUrl, telHref } from '../lib/contact'
import { formatMoney } from '../lib/money'
import { isSupabaseConfigured } from '../lib/supabase'

const currentYear = new Date().getFullYear()

const footerLinks = [
  { to: '/', label: 'Shop all teas' },
  { to: '/teas', label: 'Our teas & services' },
  { to: '/cart', label: 'Your cart' },
  { to: '/checkout', label: 'Demo checkout' },
  { to: '/credits', label: 'Image credits' },
]

export function Footer() {
  const address = formatAddress(siteConfig.contact.addressLines)
  const mailUrl = gmailComposeUrl(
    siteConfig.contact.email,
    'Tea enquiry from the website',
  )
  const mapsUrl = googleMapsUrl(address)

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link className="brand footer-brand-link" to="/">
            <span className="brand-seal" aria-hidden="true">
              <BrandMark />
            </span>
            <span className="brand-text">
              <span className="brand-name">{siteConfig.brand}</span>
              <span className="brand-tagline">{siteConfig.tagline}</span>
            </span>
          </Link>
          <p>
            Considered loose-leaf teas and caffeine-free infusions, packed in
            generous pouches from 250 g to 5 kg for everyday rituals.
          </p>
          <p className="footer-demo-note">
            {isSupabaseConfigured
              ? 'This demo store records your order for the shop, but no real card payments are processed.'
              : 'This is a demo storefront. Sample content only; no orders or payments are processed.'}
          </p>
        </div>

        <nav className="footer-column" aria-labelledby="footer-shop-heading">
          <h2 id="footer-shop-heading">Explore</h2>
          <ul>
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-column" aria-labelledby="footer-service-heading">
          <h2 id="footer-service-heading">Service</h2>
          <ul>
            <li>Free shipping on orders {formatMoney(siteConfig.shipping.freeThresholdCents)}+</li>
            <li>
              Flat {formatMoney(siteConfig.shipping.flatRateCents)} demo shipping otherwise
            </li>
            <li>Gift packaging on request</li>
            <li>Bulk inquiries welcome</li>
          </ul>
        </div>

        <div className="footer-column" aria-labelledby="footer-contact-heading">
          <h2 id="footer-contact-heading">Contact</h2>
          <address>
            <a href={mailUrl} target="_blank" rel="noopener noreferrer">
              <Mail aria-hidden="true" /> {siteConfig.contact.email}
              <span className="sr-only">
                {' '}
                (opens Gmail compose in a new tab)
              </span>
            </a>
            {siteConfig.contact.phones.map((phone) => (
              <a key={phone} href={telHref(phone)}>
                <Phone aria-hidden="true" /> {phone}
              </a>
            ))}
            <span className="contact-line">
              <MapPin aria-hidden="true" />
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                {address}
                <span className="sr-only">
                  {' '}
                  (opens Google Maps in a new tab)
                </span>
              </a>
            </span>
            <span className="contact-line">
              <Clock aria-hidden="true" />
              {siteConfig.contact.hours}
            </span>
          </address>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>
          © {currentYear} {siteConfig.brand}. Demo project.
        </p>
        <p>Currency: {siteConfig.currency}</p>
      </div>
    </footer>
  )
}


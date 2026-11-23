import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Gift,
  Leaf,
  MessageCircle,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react'
import {
  brewingTable,
  categoryGuides,
  choosingSteps,
  serviceItems,
} from '../data/content'
import { siteConfig } from '../data/site'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatMoney } from '../lib/money'

const serviceIcons = [MessageCircle, Gift, Truck, Users]

export function TeaInfoPage() {
  usePageTitle('Our teas & services')

  return (
    <>
      <section className="info-hero">
        <div className="shell info-hero-grid">
          <div className="info-hero-copy">
            <p className="eyebrow">Our teas &amp; services</p>
            <h1>
              A small shelf, <em>thoughtfully chosen.</em>
            </h1>
            <p className="info-lede">
              Cha Ghor is a demo tea atelier built around a simple idea:
              a good cup should be easy to make, easy to understand, and worth
              slowing down for. Our range spans classic tea styles and
              caffeine-free herbal infusions, packed from 250 g up to 5 kg.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-large" to="/">
                Shop the collection
                <ArrowRight aria-hidden="true" />
              </Link>
              <a className="btn btn-secondary btn-large" href="#brewing">
                Brewing guide
              </a>
            </div>
          </div>
          <div className="info-hero-media" aria-hidden="true">
            <img
              className="info-photo info-photo-main"
              src="/images/tea-garden-hero.jpg"
              alt=""
              width="1600"
              height="1100"
              loading="lazy"
            />
            <img
              className="info-photo info-photo-small"
              src="/images/matcha.jpg"
              alt=""
              width="1000"
              height="750"
              loading="lazy"
            />
            <div className="info-quote">
              <Sparkles aria-hidden="true" />
              <p>“Twenty ways to pause, from brisk morning cups to quiet herbal infusions.”</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" aria-labelledby="range-heading">
        <div className="section-heading section-heading-left">
          <p className="eyebrow">Know your leaf</p>
          <h2 id="range-heading">Tea plant or herbal infusion?</h2>
          <p>
            The clearest dividing line in the collection is botanical. Black,
            green, white, oolong, and fermented teas all come from the tea plant,
            <em> Camellia sinensis</em>. Herbal infusions — also called tisanes —
            come from other plants and are naturally caffeine-free.
          </p>
        </div>

        <div className="distinction-grid">
          <article className="distinction-card distinction-tea">
            <span className="distinction-icon" aria-hidden="true">
              <Leaf />
            </span>
            <h3>True teas</h3>
            <p>
              Made from the leaves of <em>Camellia sinensis</em>. The style is
              shaped by how those leaves are processed — oxidised, steamed,
              pan-fired, rolled, or aged.
            </p>
            <p className="distinction-foot">
              Black · Green · White · Oolong · Fermented
            </p>
          </article>
          <article className="distinction-card distinction-herbal">
            <span className="distinction-icon" aria-hidden="true">
              <Leaf />
            </span>
            <h3>Herbal infusions</h3>
            <p>
              Caffeine-free infusions made from flowers, leaves, roots, or fruit.
              Rooibos, chamomile, peppermint, hibiscus, and ginger with lemongrass
              are tisanes, not tea from the tea plant.
            </p>
            <p className="distinction-foot">Naturally caffeine-free</p>
          </article>
        </div>
      </section>

      <section className="section section-tinted" aria-labelledby="styles-heading">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">The six styles</p>
            <h2 id="styles-heading">What is in the cup?</h2>
            <p>
              A short guide to the character of each style in our range. Use it
              as a starting point, then let your own taste lead.
            </p>
          </div>

          <div className="style-grid">
            {categoryGuides.map((guide) => (
              <article className="style-card" key={guide.category}>
                <div className="style-card-top">
                  <span className="style-label">{guide.label}</span>
                  <span className="style-count">
                    {guide.category === 'Herbal' ? 'Caffeine-free' : 'Tea plant'}
                  </span>
                </div>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
                <p className="style-character">
                  <strong>In the cup:</strong> {guide.character}
                </p>
                <p className="style-examples">
                  <strong>In our range:</strong> {guide.examples.join(' · ')}
                </p>
                <Link
                  className="text-link"
                  to={`/?category=${guide.category}#teas`}
                >
                  Shop {guide.label.toLowerCase()}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell" aria-labelledby="choosing-heading">
        <div className="split-section">
          <div className="section-heading section-heading-left">
            <p className="eyebrow">Choosing well</p>
            <h2 id="choosing-heading">A simple way to find your tea</h2>
            <p>
              You do not need a tasting vocabulary to choose a tea you enjoy.
              Begin with flavour, consider whether you want caffeine, and keep the
              ritual uncomplicated.
            </p>
          </div>
          <ol className="step-list">
            {choosingSteps.map((step, index) => (
              <li key={step.title}>
                <span className="step-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="brewing" className="section section-tinted" aria-labelledby="brewing-heading">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">The daily brew</p>
            <h2 id="brewing-heading">Brewing, without the fuss</h2>
            <p>
              These are practical starting points, not strict rules. Adjust the
              leaf, water, and time until the cup tastes right to you.
            </p>
          </div>

          <div className="table-scroll" tabIndex={0} role="region" aria-label="Brewing guide table">
            <table>
              <caption className="sr-only">
                Suggested water temperature, tea amount, and steeping time by tea style
              </caption>
              <thead>
                <tr>
                  <th scope="col">Style</th>
                  <th scope="col">Leaf</th>
                  <th scope="col">Water</th>
                  <th scope="col">Time</th>
                  <th scope="col">Note</th>
                </tr>
              </thead>
              <tbody>
                {brewingTable.map((row) => (
                  <tr key={row.style}>
                    <th scope="row">{row.style}</th>
                    <td>{row.amount}</td>
                    <td>{row.water}</td>
                    <td>{row.time}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="brewing-tips">
            <div>
              <h3>Three things that make a difference</h3>
              <ul>
                <li>Use freshly drawn water and pour it while it is still hot enough for the style.</li>
                <li>Give green and white teas cooler water so their sweetness has room to show.</li>
                <li>Set a timer for the first few brews, then adjust to taste.</li>
              </ul>
            </div>
            <div className="brew-note">
              <Sparkles aria-hidden="true" />
              <p>
                Matcha is whisked rather than steeped: use 1–2 g in 60–80 ml of
                water at about 80°C and whisk until frothy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="section shell" aria-labelledby="services-heading">
        <div className="section-heading">
          <p className="eyebrow">Here to help</p>
          <h2 id="services-heading">Services at the tea table</h2>
          <p>{siteConfig.demoNotes.content}</p>
        </div>

        <div className="service-grid">
          {serviceItems.map((service, index) => {
            const Icon = serviceIcons[index] ?? MessageCircle
            return (
              <article className="service-card" key={service.title}>
                <span className="service-icon" aria-hidden="true">
                  <Icon />
                </span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a className="text-link" href={service.href}>
                  {service.actionLabel}
                  <ArrowRight aria-hidden="true" />
                </a>
              </article>
            )
          })}
        </div>

        <div id="shipping-details" className="shipping-panel">
          <span className="shipping-icon" aria-hidden="true">
            <Truck />
          </span>
          <div>
            <p className="eyebrow">Shipping, stated simply</p>
            <h3>One flat demo rate, no hidden extras</h3>
            <p>
              Shipping is{' '}
              <strong>{formatMoney(siteConfig.shipping.flatRateCents)}</strong>{' '}
              flat on orders below{' '}
              <strong>{formatMoney(siteConfig.shipping.freeThresholdCents)}</strong>,
              and free at or above that amount. No tax or other charges are added
              in this demo. Delivery windows vary by destination; no delivery date
              is guaranteed.
            </p>
            <p className="sample-note">
              These service details are sample wording. Confirm final policies,
              pricing, and delivery information before launch.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

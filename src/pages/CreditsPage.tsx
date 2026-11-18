import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink, Info } from 'lucide-react'
import { imageCreditNote, imageCredits } from '../data/credits'
import { usePageTitle } from '../hooks/usePageTitle'

export function CreditsPage() {
  usePageTitle('Image credits & demo notes')

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Credits &amp; notes</p>
          <h1>Image credits</h1>
          <p className="page-subtitle">
            The photographs in this demo come from Wikimedia Commons. Each image
            remains under the license shown; credits do not imply endorsement by
            the photographers.
          </p>
        </div>
      </section>

      <section className="section shell">
        <div className="credit-note">
          <Info aria-hidden="true" />
          <p>{imageCreditNote}</p>
        </div>

        <ul className="credit-grid">
          {imageCredits.map((credit) => (
            <li className="credit-card" key={credit.file}>
              <img
                src={`/images/${credit.file}`}
                alt={`Photograph: ${credit.title}`}
                width="320"
                height="240"
                loading="lazy"
              />
              <div className="credit-copy">
                <h2>{credit.title}</h2>
                <p>
                  By <strong>{credit.creator}</strong>
                </p>
                <p className="credit-links">
                  <a
                    href={credit.licenseUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {credit.license}
                    <ExternalLink aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={credit.source}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Source
                    <ExternalLink aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="launch-notes">
          <h2>Sample details to replace before launch</h2>
          <ul>
            <li>
              Business name and contact details — email, phone numbers, address,
              and opening hours — are set in <code>src/data/site.ts</code>. Keep
              them up to date.
            </li>
            <li>
              Service wording for support, gift packaging, delivery, and bulk
              inquiries is sample copy and needs a business review.
            </li>
            <li>
              Product names, origins, prices, brewing notes, and package sizes are
              editable sample data. Currency and shipping settings live in{' '}
              <code>src/data/site.ts</code>.
            </li>
            <li>
              Product photographs are illustrative Wikimedia Commons images.
              Replace them with original packshots and keep final license records.
            </li>
          </ul>
          <Link className="btn btn-primary" to="/">
            Back to the shop
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}

import { useDeferredValue, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { ProductModal } from '../components/ProductModal'
import {
  getSalePriceCents,
  products,
  SALE_RATE,
  teaCategories,
  type TeaCategory,
  type TeaProduct,
} from '../data/products'
import { siteConfig } from '../data/site'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatDiscount, formatMoney } from '../lib/money'

type CategoryFilter = 'All' | TeaCategory
type SortKey = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

const categoryCounts = products.reduce<Record<string, number>>(
  (counts, product) => {
    counts[product.category] = (counts[product.category] ?? 0) + 1
    counts.All = (counts.All ?? 0) + 1
    return counts
  },
  {},
)

function readCategory(value: string | null): CategoryFilter {
  if (value && (teaCategories as readonly string[]).includes(value)) {
    return value as TeaCategory
  }
  return 'All'
}

export function ShopPage() {
  usePageTitle('Shop teas')
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('name-asc')
  const [selectedProduct, setSelectedProduct] = useState<TeaProduct | null>(null)
  const deferredSearch = useDeferredValue(search)
  const category = readCategory(searchParams.get('category'))

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLocaleLowerCase()
    const result = products.filter((product) => {
      const matchesCategory =
        category === 'All' || product.category === category
      if (!matchesCategory) return false
      if (!query) return true
      const haystack = [
        product.name,
        product.variety,
        product.category,
        product.flavor,
        product.caffeine,
        ...product.tastingNotes,
      ]
        .join(' ')
        .toLocaleLowerCase()
      return haystack.includes(query)
    })

    return result.sort((a, b) => {
      switch (sort) {
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return getSalePriceCents(a.originalPriceCents) - getSalePriceCents(b.originalPriceCents)
        case 'price-desc':
          return getSalePriceCents(b.originalPriceCents) - getSalePriceCents(a.originalPriceCents)
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }, [category, deferredSearch, sort])

  function setCategory(nextCategory: CategoryFilter) {
    const next = new URLSearchParams(searchParams)
    if (nextCategory === 'All') {
      next.delete('category')
    } else {
      next.set('category', nextCategory)
    }
    setSearchParams(next, { replace: true })
  }

  function clearFilters() {
    setSearch('')
    setSort('name-asc')
    const next = new URLSearchParams(searchParams)
    next.delete('category')
    setSearchParams(next, { replace: true })
  }

  const hasActiveFilters = search.trim().length > 0 || category !== 'All'
  const isFiltering = search !== deferredSearch

  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line" aria-hidden="true" />
              Loose leaf · 100 g pouches
            </p>
            <h1>
              Find your <em>quiet cup.</em>
            </h1>
            <p className="hero-lede">
              Twenty considered teas and caffeine-free infusions, chosen for the
              way they taste and the pause they make. Every 100 g pouch is{' '}
              <strong>{formatDiscount(SALE_RATE)}</strong> for our demo launch.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-large" href="#teas">
                Shop Teas
                <ArrowRight aria-hidden="true" />
              </a>
              <Link className="btn btn-secondary btn-large" to="/teas">
                Our teas &amp; services
              </Link>
            </div>
            <ul className="hero-facts">
              <li>
                <CheckCircle2 aria-hidden="true" />
                20 teas across six styles
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                Free shipping over {formatMoney(siteConfig.shipping.freeThresholdCents)}
              </li>
            </ul>
          </div>

          <figure className="hero-media">
            <img
              src="/images/tea-garden-hero.jpg"
              alt="Rows of tea bushes in a hillside garden at sunset, with tall trees and layered hills."
              width="1600"
              height="1100"
              fetchPriority="high"
            />
            <div className="hero-stamp" aria-hidden="true">
              <Sparkles />
              <span>
                20% off
                <small>every pouch</small>
              </span>
            </div>
            <figcaption>
              <span className="caption-rule" aria-hidden="true" />
              A tea garden at dusk
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="benefit-strip" aria-label="Shop benefits">
        <div className="shell benefit-grid">
          <div className="benefit">
            <Leaf aria-hidden="true" />
            <div>
              <h2>Twenty considered teas</h2>
              <p>Black, green, white, oolong, fermented, and herbal.</p>
            </div>
          </div>
          <div className="benefit">
            <Truck aria-hidden="true" />
            <div>
              <h2>Simple demo shipping</h2>
              <p>
                Flat {formatMoney(siteConfig.shipping.flatRateCents)}, free over{' '}
                {formatMoney(siteConfig.shipping.freeThresholdCents)}.
              </p>
            </div>
          </div>
          <div className="benefit">
            <ShieldCheck aria-hidden="true" />
            <div>
              <h2>No-pressure checkout</h2>
              <p>Demo orders only — no real payment details are collected.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="teas" className="section catalog-section" aria-labelledby="catalog-heading">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">The collection</p>
            <h2 id="catalog-heading">Twenty teas for every kind of pause</h2>
            <p>
              Browse the full shelf, search by name, or filter by style. Prices
              show the original and the 20% launch price.
            </p>
          </div>

          <div className="catalog-toolbar">
            <div className="search-field">
              <label className="field-label" htmlFor="tea-search">
                Search teas
              </label>
              <div className="input-with-icon">
                <Search aria-hidden="true" />
                <input
                  id="tea-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Try “jasmine”, “mint”, or “Assam”"
                  autoComplete="off"
                />
                {search ? (
                  <button
                    type="button"
                    className="input-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <X aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="sort-field">
              <label className="field-label" htmlFor="tea-sort">
                Sort by
              </label>
              <select
                id="tea-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
              >
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="category-filter" role="group" aria-label="Filter by tea category">
            {(['All', ...teaCategories] as CategoryFilter[]).map((item) => {
              const isActive = category === item
              return (
                <button
                  key={item}
                  type="button"
                  className={`filter-pill${isActive ? ' active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => setCategory(item)}
                >
                  {item === 'All' ? 'All teas' : item}
                  <span className="filter-count">{categoryCounts[item] ?? 0}</span>
                </button>
              )
            })}
          </div>

          <div className="results-bar" aria-live="polite">
            <p>
              Showing <strong>{filteredProducts.length}</strong>{' '}
              {filteredProducts.length === 1 ? 'tea' : 'teas'}
              {category !== 'All' ? ` in ${category}` : ''}
              {search.trim() ? ` for “${search.trim()}”` : ''}
              {isFiltering ? ' …' : ''}
            </p>
            {hasActiveFilters ? (
              <button type="button" className="text-button" onClick={clearFilters}>
                Clear filters
              </button>
            ) : null}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid" aria-busy={isFiltering}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state-compact">
              <span className="empty-icon" aria-hidden="true">
                <Search />
              </span>
              <h3>No teas match that search</h3>
              <p>
                Try a different name or clear the filters to see the full
                collection of 20 teas.
              </p>
              <button type="button" className="btn btn-primary" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="closing-band">
        <div className="shell closing-inner">
          <div>
            <p className="eyebrow">Not sure where to begin?</p>
            <h2>Start with the style, then follow your taste.</h2>
            <p>
              Our guide to black, green, white, oolong, fermented, and herbal
              teas makes choosing a little easier.
            </p>
          </div>
          <Link className="btn btn-secondary btn-large" to="/teas">
            Explore the tea guide
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      {selectedProduct ? (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </>
  )
}


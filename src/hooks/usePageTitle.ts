import { useEffect } from 'react'
import { siteConfig } from '../data/site'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${siteConfig.brand}` : siteConfig.brand
  }, [title])
}

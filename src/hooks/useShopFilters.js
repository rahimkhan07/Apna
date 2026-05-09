import { useState, useMemo } from 'react'

/**
 * useShopFilters
 *
 * Encapsulates all search + filter + sort logic for a shop listing page.
 * Keeps the page components thin — they just render what this hook returns.
 *
 * @param {Array} shops  — full list of shops for a given category
 * @returns {{
 *   search, setSearch,
 *   filters, setFilter,
 *   sortBy, setSortBy,
 *   filtered,
 *   activeFilterCount,
 *   resetFilters,
 * }}
 */
const useShopFilters = (shops = []) => {
  const [search,  setSearch]  = useState('')
  const [sortBy,  setSortBy]  = useState('default') // 'default' | 'rating' | 'delivery_time' | 'delivery_fee'
  const [filters, setFilters] = useState({
    openOnly:       false,
    minRating:      0,       // 0 = any, 3 | 3.5 | 4 | 4.5
    maxDeliveryMin: 0,       // 0 = any, 30 | 45 | 60
    freeDelivery:   false,
  })

  /** Update a single filter key */
  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  /** How many non-default filters are active (for badge count) */
  const activeFilterCount = useMemo(() => {
    let n = 0
    if (filters.openOnly)         n++
    if (filters.minRating > 0)    n++
    if (filters.maxDeliveryMin > 0) n++
    if (filters.freeDelivery)     n++
    return n
  }, [filters])

  /** Reset everything */
  const resetFilters = () => {
    setSearch('')
    setSortBy('default')
    setFilters({ openOnly: false, minRating: 0, maxDeliveryMin: 0, freeDelivery: false })
  }

  /** Parse "20-30 min" → upper bound integer (30) for comparison */
  const parseDeliveryMax = (str = '') => {
    const parts = str.replace(/\s*min/i, '').split('-')
    return parseInt(parts[parts.length - 1], 10) || 999
  }

  const filtered = useMemo(() => {
    let result = [...shops]

    // ── Search ──────────────────────────────────────────────────────────────
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.cuisine?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }

    // ── Filters ─────────────────────────────────────────────────────────────
    if (filters.openOnly) {
      result = result.filter((s) => s.openStatus)
    }
    if (filters.minRating > 0) {
      result = result.filter((s) => s.rating >= filters.minRating)
    }
    if (filters.maxDeliveryMin > 0) {
      result = result.filter(
        (s) => parseDeliveryMax(s.deliveryTime) <= filters.maxDeliveryMin
      )
    }
    if (filters.freeDelivery) {
      result = result.filter((s) => s.deliveryFee === 0)
    }

    // ── Sort ────────────────────────────────────────────────────────────────
    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'delivery_time') {
      result = [...result].sort(
        (a, b) => parseDeliveryMax(a.deliveryTime) - parseDeliveryMax(b.deliveryTime)
      )
    } else if (sortBy === 'delivery_fee') {
      result = [...result].sort((a, b) => a.deliveryFee - b.deliveryFee)
    }

    return result
  }, [shops, search, filters, sortBy])

  return {
    search, setSearch,
    filters, setFilter,
    sortBy, setSortBy,
    filtered,
    activeFilterCount,
    resetFilters,
  }
}

export default useShopFilters

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown, LayoutGrid, List } from 'lucide-react'
import { getShops } from '../../utils/seedStorage'
import useShopFilters from '../../hooks/useShopFilters'
import ShopCard, { ShopCardSkeleton } from './ShopCard'
import FilterPanel from './FilterPanel'

const SORT_OPTIONS = [
  { value: 'default',       label: 'Relevance'      },
  { value: 'rating',        label: 'Top Rated'       },
  { value: 'delivery_time', label: 'Fastest Delivery'},
  { value: 'delivery_fee',  label: 'Delivery Fee'    },
]

const SKELETON_COUNT = 8

/**
 * ShopListingPage — shared listing page used by Restaurants, Cafes, SweetShops.
 *
 * Props:
 *   category   — 'restaurant' | 'cafe' | 'sweet_shop'
 *   title      — page heading e.g. "Restaurants"
 *   emoji      — heading emoji
 *   emptyMsg   — message when no results match
 */
const ShopListingPage = ({ category, title, emoji, emptyMsg }) => {
  const [loading,        setLoading]        = useState(true)
  const [allShops,       setAllShops]       = useState([])
  const [filterOpen,     setFilterOpen]     = useState(false)
  const [sortOpen,       setSortOpen]       = useState(false)
  const [viewMode,       setViewMode]       = useState('grid') // 'grid' | 'list'

  // Load shops from localStorage (simulates async fetch)
  useEffect(() => {
    const timer = setTimeout(() => {
      const shops = getShops().filter((s) => s.category === category)
      setAllShops(shops)
      setLoading(false)
    }, 900)
    return () => clearTimeout(timer)
  }, [category])

  const {
    search, setSearch,
    filters, setFilter,
    sortBy, setSortBy,
    filtered,
    activeFilterCount,
    resetFilters,
  } = useShopFilters(allShops)

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Relevance'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
              {emoji} {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading
                ? 'Finding the best spots near you…'
                : `${filtered.length} ${filtered.length === 1 ? 'place' : 'places'} near you`}
            </p>
          </motion.div>

          {/* ── Search bar ─────────────────────────────────────────────── */}
          <div className="mt-4 flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5
                            focus-within:ring-2 focus-within:ring-red-400/50 focus-within:border-red-400
                            transition-all">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}…`}
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200
                           placeholder-gray-400 outline-none"
                aria-label={`Search ${title}`}
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={14} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>

            {/* Filter button — mobile */}
            <button
              onClick={() => setFilterOpen(true)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                activeFilterCount > 0
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
              }`}
              aria-label="Open filters"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* ── Sort + view mode bar ────────────────────────────────────── */}
          <div className="mt-3 flex items-center justify-between gap-3">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300
                           hover:border-gray-300 transition-colors"
              >
                Sort: <span className="font-semibold text-gray-900 dark:text-white">{currentSortLabel}</span>
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-gray-800
                               rounded-xl shadow-xl border border-gray-100 dark:border-gray-700
                               overflow-hidden min-w-[180px]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === opt.value
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-red-500'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-red-500'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + grid ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start">

        {/* Filter panel (desktop sidebar / mobile drawer) */}
        <FilterPanel
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          setFilter={setFilter}
          activeCount={activeFilterCount}
          onReset={resetFilters}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Active filter chips */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {filters.openOnly && (
                  <FilterChip label="Open now" onRemove={() => setFilter('openOnly', false)} />
                )}
                {filters.freeDelivery && (
                  <FilterChip label="Free delivery" onRemove={() => setFilter('freeDelivery', false)} />
                )}
                {filters.minRating > 0 && (
                  <FilterChip label={`⭐ ${filters.minRating}+`} onRemove={() => setFilter('minRating', 0)} />
                )}
                {filters.maxDeliveryMin > 0 && (
                  <FilterChip label={`Under ${filters.maxDeliveryMin} min`} onRemove={() => setFilter('maxDeliveryMin', 0)} />
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs text-red-500 font-semibold hover:text-red-600 transition-colors px-1"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid / List */}
          {loading ? (
            <div className={gridClass(viewMode)}>
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <ShopCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              search={search}
              emptyMsg={emptyMsg}
              emoji={emoji}
              onReset={resetFilters}
            />
          ) : (
            <motion.div layout className={gridClass(viewMode)}>
              <AnimatePresence mode="popLayout">
                {filtered.map((shop, i) => (
                  <motion.div
                    key={shop.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <ShopCard shop={shop} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Close sort dropdown on outside click */}
      {sortOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const gridClass = (viewMode) =>
  viewMode === 'grid'
    ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4'
    : 'flex flex-col gap-4'

const FilterChip = ({ label, onRemove }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
               bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
  >
    {label}
    <button onClick={onRemove} aria-label={`Remove ${label} filter`}>
      <X size={11} />
    </button>
  </motion.span>
)

const EmptyState = ({ search, emptyMsg, emoji, onReset }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-20"
  >
    <span className="text-6xl block mb-4">{search ? '🔍' : emoji}</span>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
      {search ? `No results for "${search}"` : 'Nothing here yet'}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
      {search ? 'Try a different search term or clear your filters.' : emptyMsg}
    </p>
    <button
      onClick={onReset}
      className="text-sm text-red-500 font-semibold hover:text-red-600 transition-colors"
    >
      Clear all filters
    </button>
  </motion.div>
)

export default ShopListingPage

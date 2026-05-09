import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Clock, Bike, ToggleLeft } from 'lucide-react'
import Button from '../ui/Button'

const ratingOptions      = [{ label: '4.5+', value: 4.5 }, { label: '4.0+', value: 4.0 }, { label: '3.5+', value: 3.5 }, { label: '3.0+', value: 3.0 }]
const deliveryTimeOptions = [{ label: 'Under 30 min', value: 30 }, { label: 'Under 45 min', value: 45 }, { label: 'Under 60 min', value: 60 }]

/**
 * FilterPanel — slide-in drawer (mobile) / inline panel (desktop)
 *
 * Props:
 *   isOpen          — controls visibility on mobile
 *   onClose         — close handler
 *   filters         — current filter state from useShopFilters
 *   setFilter       — setter from useShopFilters
 *   activeCount     — number of active filters (for reset label)
 *   onReset         — reset all filters
 */
const FilterPanel = ({ isOpen, onClose, filters, setFilter, activeCount, onReset }) => {
  const content = (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-base">
          Filters {activeCount > 0 && (
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="text-xs text-red-500 font-semibold hover:text-red-600 transition-colors"
            >
              Reset all
            </button>
          )}
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close filters"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Open now toggle */}
      <div>
        <button
          onClick={() => setFilter('openOnly', !filters.openOnly)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
            filters.openOnly
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className={`w-2 h-2 rounded-full ${filters.openOnly ? 'bg-green-500' : 'bg-gray-300'}`} />
            Open now only
          </span>
          <div className={`w-10 h-5 rounded-full transition-colors relative ${filters.openOnly ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.openOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Free delivery toggle */}
      <div>
        <button
          onClick={() => setFilter('freeDelivery', !filters.freeDelivery)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
            filters.freeDelivery
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Bike size={14} className={filters.freeDelivery ? 'text-blue-500' : 'text-gray-400'} />
            Free delivery only
          </span>
          <div className={`w-10 h-5 rounded-full transition-colors relative ${filters.freeDelivery ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.freeDelivery ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Min rating */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
          <Star size={12} /> Minimum Rating
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ratingOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter('minRating', filters.minRating === opt.value ? 0 : opt.value)}
              className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                filters.minRating === opt.value
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
              }`}
            >
              ⭐ {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery time */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
          <Clock size={12} /> Delivery Time
        </p>
        <div className="flex flex-col gap-2">
          {deliveryTimeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter('maxDeliveryMin', filters.maxDeliveryMin === opt.value ? 0 : opt.value)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 text-left transition-all ${
                filters.maxDeliveryMin === opt.value
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300'
              }`}
            >
              🕐 {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop: always-visible sidebar ─────────────────────────────── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm sticky top-24">
          {content}
        </div>
      </aside>

      {/* ── Mobile: slide-up drawer ──────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900
                         rounded-t-3xl p-6 pb-10 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default FilterPanel

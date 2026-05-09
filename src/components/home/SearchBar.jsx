import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const suggestions = [
  'Biryani', 'Pizza', 'Burger', 'Sushi', 'Coffee', 'Cake', 'Noodles', 'Ice Cream',
]

/**
 * SearchBar — prominent search input with quick suggestion chips
 */
const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        {/* Input */}
        <div
          className={`flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-md transition-shadow ${
            focused
              ? 'shadow-lg ring-2 ring-red-400/50'
              : 'hover:shadow-lg'
          }`}
        >
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search for restaurants, dishes, cuisines..."
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none"
            aria-label="Search food"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
          <button
            aria-label="Filters"
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Quick suggestion chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                query === s
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-red-400 hover:text-red-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default SearchBar

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getShops } from '../../utils/seedStorage'
import ShopCard from './ShopCard'
import SkeletonCard from '../ui/SkeletonCard'

const filters = ['All', 'Restaurants', 'Cafes', 'Sweet Shops']

const typeMap = {
  All:           null,
  Restaurants:   'restaurant',
  Cafes:         'cafe',
  'Sweet Shops': 'sweet_shop',
}

/**
 * FeaturedShops — filterable grid of top-rated shops, reads from localStorage
 */
const FeaturedShops = ({ loading = false }) => {
  const [activeFilter, setActiveFilter] = useState('All')
  const [allShops, setAllShops] = useState([])

  useEffect(() => {
    setAllShops(getShops())
  }, [])

  const filtered = allShops.filter(
    (s) => !typeMap[activeFilter] || s.category === typeMap[activeFilter]
  ).slice(0, 8) // show max 8 on home page

  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Featured Near You
          </h2>
          <button className="flex items-center gap-1 text-sm text-red-500 font-semibold hover:gap-2 transition-all">
            See all <ArrowRight size={14} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-red-900/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} type="shop" />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filtered.map((shop, i) => (
              <motion.div
                key={shop.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ShopCard shop={shop} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default FeaturedShops

import { motion } from 'framer-motion'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { trendingProducts } from '../../utils/dummyData'
import ProductCard from './ProductCard'
import SkeletonCard from '../ui/SkeletonCard'

/**
 * TrendingProducts — horizontal scrollable row of trending product cards
 */
const TrendingProducts = ({ loading = false }) => (
  <section className="px-4 sm:px-6 lg:px-8 mt-10">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-red-500" />
          Trending Right Now
        </h2>
        <button className="flex items-center gap-1 text-sm text-red-500 font-semibold hover:gap-2 transition-all">
          See all <ArrowRight size={14} />
        </button>
      </div>

      {/* Scrollable row */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-4 w-max sm:w-auto sm:grid sm:grid-cols-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-44 sm:w-auto shrink-0">
                  <SkeletonCard type="product" />
                </div>
              ))
            : trendingProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="w-44 sm:w-auto shrink-0"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
      </div>
    </div>
  </section>
)

export default TrendingProducts

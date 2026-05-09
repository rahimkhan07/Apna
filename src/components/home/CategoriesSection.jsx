import { motion } from 'framer-motion'
import { categories } from '../../utils/dummyData'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

/**
 * CategoriesSection — horizontal scrollable category chips with emoji icons
 */
const CategoriesSection = () => (
  <section className="px-4 sm:px-6 lg:px-8 mt-8">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        What are you craving?
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-4 sm:grid-cols-8 gap-3"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${cat.color} border border-transparent hover:border-red-300 dark:hover:border-red-700 transition-all cursor-pointer group`}
            aria-label={cat.name}
          >
            <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
              {cat.emoji}
            </span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center leading-tight">
              {cat.name}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {cat.count}+
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  </section>
)

export default CategoriesSection

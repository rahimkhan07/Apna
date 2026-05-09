import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { offerBanners } from '../../utils/dummyData'

/**
 * OfferBanners — horizontal row of promotional offer cards
 */
const OfferBanners = () => (
  <section className="px-4 sm:px-6 lg:px-8 mt-10">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        🔥 Hot Deals
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {offerBanners.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${offer.gradient} p-5 cursor-pointer group`}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium mb-0.5">{offer.subtitle}</p>
                <h3 className="text-white text-2xl font-extrabold leading-tight">
                  {offer.title}
                </h3>
                <p className="text-white/70 text-xs mt-1">{offer.description}</p>
                <button className="mt-3 flex items-center gap-1 text-white text-xs font-bold group-hover:gap-2 transition-all">
                  {offer.cta} <ArrowRight size={12} />
                </button>
              </div>
              <span className="text-4xl">{offer.emoji}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default OfferBanners

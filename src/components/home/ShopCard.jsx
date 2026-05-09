import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Bike } from 'lucide-react'
import StarRating from '../ui/StarRating'
import Badge from '../ui/Badge'

/**
 * ShopCard (home variant) — used on the Home page featured section.
 * Navigates to /shop/:id on click.
 * For the full listing-page card see components/shop/ShopCard.jsx
 */
const ShopCard = ({ shop }) => {
  const navigate = useNavigate()

  return (
    <motion.div
      onClick={() => navigate(`/shop/${shop.id}`)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer group"
      role="button"
      tabIndex={0}
      aria-label={`View ${shop.name}`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/shop/${shop.id}`)}
    >
      {/* Gradient image area */}
      <div className={`relative h-40 bg-gradient-to-br ${shop.bgColor ?? shop.banner} flex items-center justify-center`}>
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {shop.emoji ?? shop.logo}
        </span>

        {/* Discount badge */}
        {shop.discount && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-red-600 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {shop.discount}
          </div>
        )}

        {/* Closed overlay */}
        {!(shop.isOpen ?? shop.openStatus) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-2xl">
            <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">
              Currently Closed
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
            {shop.name}
          </h3>
          <StarRating rating={shop.rating} />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{shop.cuisine}</p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {shop.deliveryTime}
          </span>
          <span className="flex items-center gap-1">
            <Bike size={12} />
            {(shop.deliveryFee === 'Free' || shop.deliveryFee === 0)
              ? <span className="text-green-600 dark:text-green-400 font-semibold">Free delivery</span>
              : `₹${shop.deliveryFee}`}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {shop.tags?.map((tag) => (
            <Badge key={tag} variant="default">{tag}</Badge>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ShopCard

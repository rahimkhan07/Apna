import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Bike, MapPin, Star } from 'lucide-react'
import Badge from '../ui/Badge'

/**
 * ShopCard — full-featured card used on listing pages.
 * Navigates to /shop/:id on click.
 *
 * Props:
 *   shop    — shop object from SEED_SHOPS
 *   loading — when true renders a skeleton instead
 */
const ShopCard = ({ shop, loading = false }) => {
  const navigate = useNavigate()

  if (loading) return <ShopCardSkeleton />

  const handleClick = () => navigate(`/shop/${shop.id}`)

  return (
    <motion.article
      onClick={handleClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm
                 hover:shadow-xl transition-shadow cursor-pointer group focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-red-400"
      role="button"
      tabIndex={0}
      aria-label={`View ${shop.name}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* ── Banner ─────────────────────────────────────────────────────── */}
      <div className={`relative h-40 bg-gradient-to-br ${shop.banner} flex items-center justify-center overflow-hidden`}>

        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-black/10 rounded-full" />

        {/* Logo / emoji */}
        <span className="relative text-6xl group-hover:scale-110 transition-transform duration-300 select-none">
          {shop.logo}
        </span>

        {/* Discount pill */}
        {shop.discount && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90
                          backdrop-blur-sm text-red-600 dark:text-red-400
                          text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            {shop.discount}
          </div>
        )}

        {/* Open / Closed overlay */}
        {!shop.openStatus && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/60 px-3 py-1.5 rounded-full tracking-wide">
              Currently Closed
            </span>
          </div>
        )}

        {/* Open dot */}
        {shop.openStatus && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5
                          bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
                          px-2 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">Open</span>
          </div>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────────────────────── */}
      <div className="p-4">

        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-1">
            {shop.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-green-50 dark:bg-green-900/20
                          text-green-700 dark:text-green-400 px-2 py-0.5 rounded-lg">
            <Star size={11} fill="currentColor" />
            <span className="text-xs font-bold">{shop.rating}</span>
          </div>
        </div>

        {/* Cuisine + review count */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{shop.cuisine}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3">
          {shop.reviewCount?.toLocaleString('en-IN')} reviews
        </p>

        {/* Delivery meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-gray-400" />
            {shop.deliveryTime}
          </span>
          <span className="flex items-center gap-1">
            <Bike size={12} className="text-gray-400" />
            {shop.deliveryFee === 0
              ? <span className="text-green-600 dark:text-green-400 font-semibold">Free delivery</span>
              : `₹${shop.deliveryFee} delivery`}
          </span>
        </div>

        {/* Address */}
        <p className="flex items-start gap-1 text-[11px] text-gray-400 dark:text-gray-500 mb-3 line-clamp-1">
          <MapPin size={11} className="mt-0.5 shrink-0" />
          {shop.address}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {shop.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="default">{tag}</Badge>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const ShopCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-40 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10" />
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="flex gap-2 pt-1">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
      </div>
    </div>
  </div>
)

export default ShopCard

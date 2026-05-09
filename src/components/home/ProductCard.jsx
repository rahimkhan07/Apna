import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import StarRating from '../ui/StarRating'
import Badge from '../ui/Badge'
import useCartStore from '../../store/useCartStore'

/**
 * ProductCard — compact card for trending products with add-to-cart
 */
const ProductCard = ({ product }) => {
  const { items, addItem, removeItem } = useCartStore()
  const cartItem = items.find((i) => i.id === product.id)
  const qty = cartItem?.qty ?? 0

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  )

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Emoji image area */}
      <div className="relative h-36 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
        <span className="text-5xl">{product.emoji}</span>

        {/* Veg / Non-veg indicator */}
        <div
          className={`absolute top-2 left-2 w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
            product.isVeg
              ? 'border-green-600 bg-white dark:bg-gray-800'
              : 'border-red-600 bg-white dark:bg-gray-800'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              product.isVeg ? 'bg-green-600' : 'bg-red-600'
            }`}
          />
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <Badge variant="warning" className="mb-1.5">{product.tag}</Badge>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-0.5 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{product.shop}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              ₹{product.price}
            </span>
            <span className="text-xs text-gray-400 line-through ml-1">
              ₹{product.originalPrice}
            </span>
          </div>

          {/* Add / quantity control */}
          {qty === 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => addItem(product)}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md shadow-red-200 dark:shadow-red-900/30 transition-colors"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus size={12} /> ADD
            </motion.button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 rounded-xl px-1 py-0.5">
              <button
                onClick={() => removeItem(product.id)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={10} />
              </button>
              <span className="text-sm font-bold text-red-600 dark:text-red-400 min-w-[16px] text-center">
                {qty}
              </span>
              <button
                onClick={() => addItem(product)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard

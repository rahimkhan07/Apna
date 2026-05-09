import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Plus, Minus, Trash2, ShoppingBag,
  ChevronRight, Tag, ArrowRight,
} from 'lucide-react'
import useCartStore from '../../store/useCartStore'
import useToastStore from '../../store/useToastStore'

/**
 * CartDrawer — slide-in panel from the right.
 *
 * Props:
 *   isOpen   — boolean
 *   onClose  — () => void
 */
const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const {
    items, addItem, removeItem, deleteItem, clearCart,
    subtotal, deliveryFee, discount, grandTotal,
    coupon, couponError, applyCoupon, removeCoupon,
    shopName,
  } = useCartStore()

  const { success, info } = useToastStore()

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  const handleClear = () => {
    clearCart()
    info('Cart cleared')
  }

  const sub  = subtotal()
  const fee  = deliveryFee()
  const disc = discount()
  const total = grandTotal()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm
                       bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
            aria-label="Cart drawer"
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4
                            border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div>
                <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">
                  Your Cart
                </h2>
                {shopName && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    from {shopName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-500 hover:text-red-600 font-semibold
                               flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                             text-gray-500 dark:text-gray-400 transition-colors"
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            {items.length === 0 ? (
              <DrawerEmptyState onClose={onClose} />
            ) : (
              <>
                {/* Items list */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <DrawerItem
                        key={item.id}
                        item={item}
                        onAdd={() => {
                          addItem(item)
                          success(`${item.name} qty updated`)
                        }}
                        onRemove={() => removeItem(item.id)}
                        onDelete={() => {
                          deleteItem(item.id)
                          info(`${item.name} removed`)
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* ── Footer ─────────────────────────────────────────── */}
                <div className="shrink-0 border-t border-gray-100 dark:border-gray-800
                                px-5 py-4 space-y-3 bg-white dark:bg-gray-900">

                  {/* Coupon row */}
                  <CouponRow
                    coupon={coupon}
                    couponError={couponError}
                    onApply={(code) => {
                      const ok = applyCoupon(code)
                      if (ok) success(`Coupon "${code}" applied! 🎉`)
                    }}
                    onRemove={() => { removeCoupon(); info('Coupon removed') }}
                  />

                  {/* Price breakdown */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span>₹{sub}</span>
                    </div>
                    <div className={`flex justify-between ${
                      fee === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span>Delivery</span>
                      <span>{fee === 0 ? 'FREE' : `₹${fee}`}</span>
                    </div>
                    {disc > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                        <span>Discount ({coupon?.code})</span>
                        <span>− ₹{disc}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-gray-900 dark:text-white
                                    text-base pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span>Total</span>
                      <motion.span
                        key={total}
                        initial={{ scale: 1.15, color: '#ef4444' }}
                        animate={{ scale: 1,    color: 'inherit' }}
                        transition={{ duration: 0.3 }}
                      >
                        ₹{total}
                      </motion.span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCheckout}
                    className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold
                               rounded-2xl text-sm transition-colors shadow-lg shadow-red-200
                               dark:shadow-red-900/30 flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </motion.button>

                  {sub < 299 && fee > 0 && (
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                      Add ₹{299 - sub} more for free delivery
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── DrawerItem ───────────────────────────────────────────────────────────────

const DrawerItem = ({ item, onAdd, onRemove, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800
               rounded-2xl p-3"
  >
    {/* Image */}
    <div className="w-12 h-12 shrink-0 bg-white dark:bg-gray-700 rounded-xl
                    flex items-center justify-center text-2xl shadow-sm">
      {item.image ?? item.emoji}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
        {item.name}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        ₹{item.price} × {item.qty} = <span className="font-bold text-gray-700 dark:text-gray-300">₹{item.price * item.qty}</span>
      </p>
    </div>

    {/* Qty stepper */}
    <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-xl
                    px-0.5 py-0.5 shadow-sm shrink-0">
      <button
        onClick={onRemove}
        className="w-6 h-6 flex items-center justify-center rounded-lg
                   bg-red-500 hover:bg-red-600 text-white transition-colors"
        aria-label="Decrease"
      >
        <Minus size={10} />
      </button>
      <motion.span
        key={item.qty}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="text-xs font-extrabold text-gray-900 dark:text-white w-5 text-center"
      >
        {item.qty}
      </motion.span>
      <button
        onClick={onAdd}
        className="w-6 h-6 flex items-center justify-center rounded-lg
                   bg-red-500 hover:bg-red-600 text-white transition-colors"
        aria-label="Increase"
      >
        <Plus size={10} />
      </button>
    </div>

    {/* Delete */}
    <button
      onClick={onDelete}
      className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600
                 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                 transition-colors shrink-0"
      aria-label="Remove item"
    >
      <Trash2 size={14} />
    </button>
  </motion.div>
)

// ─── CouponRow ────────────────────────────────────────────────────────────────

const CouponRow = ({ coupon, couponError, onApply, onRemove }) => {
  if (coupon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-green-50 dark:bg-green-900/20
                   border border-green-200 dark:border-green-800/50
                   rounded-xl px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-green-600 dark:text-green-400" />
          <div>
            <p className="text-xs font-bold text-green-700 dark:text-green-400">
              {coupon.code} applied
            </p>
            <p className="text-[10px] text-green-600 dark:text-green-500">{coupon.label}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
        >
          Remove
        </button>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const code = e.target.coupon.value.trim()
        if (code) onApply(code)
      }}
      className="flex gap-2"
    >
      <div className="flex-1 relative">
        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          name="coupon"
          type="text"
          placeholder="Coupon code"
          className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800
                     border border-gray-200 dark:border-gray-700 rounded-xl
                     text-gray-700 dark:text-gray-200 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-red-400/50
                     focus:border-red-400 transition-all uppercase"
          aria-label="Coupon code"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs
                   font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600
                   transition-colors shrink-0"
      >
        Apply
      </button>
      {couponError && (
        <p className="absolute text-[10px] text-red-500 mt-1">{couponError}</p>
      )}
    </form>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

const DrawerEmptyState = ({ onClose }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Illustration */}
      <div className="relative w-40 h-40 mx-auto mb-6">
        <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 rounded-full" />
        <div className="absolute inset-4 bg-red-100 dark:bg-red-900/30 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          🛒
        </div>
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">
        Your cart is empty
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
        Looks like you haven't added anything yet. Browse our restaurants, cafés, and sweet shops!
      </p>
      <button
        onClick={onClose}
        className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-500 hover:bg-red-600
                   text-white font-bold rounded-2xl text-sm transition-colors
                   shadow-lg shadow-red-200 dark:shadow-red-900/30"
      >
        <ShoppingBag size={16} /> Start Exploring
      </button>
    </motion.div>
  </div>
)

export default CartDrawer

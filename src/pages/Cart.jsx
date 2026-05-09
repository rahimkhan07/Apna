import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight,
  Tag, ChevronRight, Bike, Clock, Store,
  CheckCircle, X, AlertCircle,
} from 'lucide-react'
import useCartStore from '../store/useCartStore'
import useToastStore from '../store/useToastStore'

// ─── Available coupon hints shown below the input ─────────────────────────────
const COUPON_HINTS = [
  { code: 'FIRST50',  label: '50% off first order' },
  { code: 'FREEDEL',  label: 'Free delivery'        },
  { code: 'FLAT50',   label: '₹50 off on ₹399+'     },
]

// ─── Main Cart page ───────────────────────────────────────────────────────────

const Cart = () => {
  const navigate = useNavigate()
  const {
    items, addItem, removeItem, deleteItem, clearCart,
    subtotal, deliveryFee, discount, grandTotal,
    coupon, couponError, applyCoupon, removeCoupon,
    shopName, shopId,
  } = useCartStore()

  const { success, error, info, warning } = useToastStore()
  const [couponInput, setCouponInput] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const sub   = subtotal()
  const fee   = deliveryFee()
  const disc  = discount()
  const total = grandTotal()

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleAdd = (item) => {
    addItem(item)
    success(`${item.name} qty updated`, { duration: 1500 })
  }

  const handleRemove = (item) => {
    removeItem(item.id)
  }

  const handleDelete = (item) => {
    deleteItem(item.id)
    info(`${item.name} removed from cart`)
  }

  const handleClear = () => {
    clearCart()
    setShowClearConfirm(false)
    warning('Cart cleared')
  }

  const handleCoupon = (e) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    const ok = applyCoupon(couponInput)
    if (ok) {
      success(`Coupon "${couponInput.toUpperCase()}" applied! 🎉`)
      setCouponInput('')
    } else {
      error(couponError || 'Invalid coupon code')
    }
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="text-center max-w-sm"
        >
          {/* Illustration */}
          <div className="relative w-52 h-52 mx-auto mb-8">
            <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 rounded-full" />
            <div className="absolute inset-6 bg-red-100 dark:bg-red-900/30 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl">🛒</span>
            </div>
            {/* Floating food emojis */}
            {['🍔', '🍕', '☕'].map((e, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl"
                style={{
                  top:  i === 0 ? '10%' : i === 1 ? '60%' : '15%',
                  left: i === 0 ? '5%'  : i === 1 ? '5%'  : '75%',
                }}
                animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
              >
                {e}
              </motion.span>
            ))}
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            Looks like you haven't added anything yet. Explore our restaurants, cafés, and sweet shops!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500
                         hover:bg-red-600 text-white font-bold rounded-2xl text-sm
                         transition-colors shadow-lg shadow-red-200 dark:shadow-red-900/30"
            >
              <ShoppingBag size={16} /> Explore Food
            </Link>
            <Link
              to="/restaurants"
              className="flex items-center justify-center gap-2 px-6 py-3
                         border-2 border-gray-200 dark:border-gray-700
                         text-gray-700 dark:text-gray-300 font-semibold rounded-2xl text-sm
                         hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <Store size={16} /> Browse Restaurants
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32 lg:pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Your Cart
            </h1>
            {shopName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                <Store size={13} /> {shopName}
                {shopId && (
                  <button
                    onClick={() => navigate(`/shop/${shopId}`)}
                    className="text-red-500 hover:text-red-600 font-semibold transition-colors"
                  >
                    · View menu
                  </button>
                )}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600
                       font-semibold transition-colors"
          >
            <Trash2 size={14} /> Clear cart
          </button>
        </motion.div>

        {/* ── Two-column layout ─────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: items ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <CartItem
                  key={item.id}
                  item={item}
                  index={i}
                  onAdd={() => handleAdd(item)}
                  onRemove={() => handleRemove(item)}
                  onDelete={() => handleDelete(item)}
                />
              ))}
            </AnimatePresence>

            {/* Delivery info strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium ${
                fee === 0
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
              }`}
            >
              <Bike size={16} className="shrink-0" />
              {fee === 0
                ? <span>🎉 You've unlocked <strong>free delivery!</strong></span>
                : <span>Add <strong>₹{299 - sub}</strong> more to get free delivery</span>}
            </motion.div>
          </div>

          {/* ── Right: order summary ──────────────────────────────────────── */}
          <div className="w-full lg:w-96 shrink-0 space-y-4">

            {/* Coupon card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Tag size={16} className="text-red-500" /> Coupon Code
              </h3>

              {coupon ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between bg-green-50 dark:bg-green-900/20
                             border border-green-200 dark:border-green-800/50
                             rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">
                        {coupon.code}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">{coupon.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { removeCoupon(); info('Coupon removed') }}
                    className="p-1 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40
                               text-green-600 dark:text-green-400 transition-colors"
                    aria-label="Remove coupon"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                <>
                  <form onSubmit={handleCoupon} className="flex gap-2 mb-3">
                    <div className="flex-1 relative">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="w-full pl-8 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700
                                   border border-gray-200 dark:border-gray-600 rounded-xl
                                   text-gray-700 dark:text-gray-200 placeholder-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-red-400/50
                                   focus:border-red-400 transition-all uppercase tracking-wider"
                        aria-label="Coupon code"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white
                                 text-sm font-bold rounded-xl hover:bg-gray-800
                                 dark:hover:bg-gray-600 transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Coupon hints */}
                  <div className="flex flex-wrap gap-2">
                    {COUPON_HINTS.map((h) => (
                      <button
                        key={h.code}
                        onClick={() => {
                          const ok = applyCoupon(h.code)
                          if (ok) success(`Coupon "${h.code}" applied! 🎉`)
                          else error(couponError || 'Cannot apply this coupon')
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                                   font-semibold bg-gray-100 dark:bg-gray-700
                                   text-gray-600 dark:text-gray-300
                                   hover:bg-red-50 dark:hover:bg-red-900/20
                                   hover:text-red-600 dark:hover:text-red-400
                                   border border-gray-200 dark:border-gray-600
                                   hover:border-red-300 transition-all"
                      >
                        <Tag size={10} /> {h.code}
                        <span className="text-gray-400 dark:text-gray-500">· {h.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Order summary card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>

              <div className="space-y-2.5 text-sm mb-4">
                <SummaryRow label={`Subtotal (${items.reduce((s, i) => s + i.qty, 0)} items)`} value={`₹${sub}`} />
                <SummaryRow
                  label="Delivery fee"
                  value={fee === 0 ? 'FREE' : `₹${fee}`}
                  valueClass={fee === 0 ? 'text-green-600 dark:text-green-400 font-bold' : ''}
                />
                {disc > 0 && (
                  <SummaryRow
                    label={`Discount (${coupon?.code})`}
                    value={`− ₹${disc}`}
                    valueClass="text-green-600 dark:text-green-400 font-bold"
                  />
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-gray-900 dark:text-white text-base">
                    Grand Total
                  </span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.2, color: '#ef4444' }}
                    animate={{ scale: 1,   color: 'inherit' }}
                    transition={{ duration: 0.35 }}
                    className="font-extrabold text-gray-900 dark:text-white text-xl"
                  >
                    ₹{total}
                  </motion.span>
                </div>
                {disc > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    You're saving ₹{disc} on this order 🎉
                  </p>
                )}
              </div>

              {/* Checkout CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-extrabold
                           rounded-2xl text-base transition-colors shadow-xl shadow-red-200
                           dark:shadow-red-900/30 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </motion.button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">🔒 Secure payment</span>
                <span className="flex items-center gap-1">⚡ Fast delivery</span>
              </div>
            </motion.div>

            {/* Delivery estimate */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm
                         flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-2xl
                              flex items-center justify-center shrink-0">
                <Clock size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Estimated delivery
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  25–40 min · Delivering to your saved address
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky checkout bar ────────────────────────────────────── */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
        className="lg:hidden fixed bottom-16 left-0 right-0 z-40 px-4 pb-2"
      >
        <button
          onClick={() => navigate('/checkout')}
          className="w-full flex items-center justify-between bg-red-500 hover:bg-red-600
                     text-white px-5 py-4 rounded-2xl shadow-2xl shadow-red-400/40
                     dark:shadow-red-900/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-600 rounded-xl w-8 h-8 flex items-center justify-center
                            text-sm font-extrabold shrink-0">
              {items.reduce((s, i) => s + i.qty, 0)}
            </div>
            <span className="font-bold">Place Order</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg">₹{total}</span>
            <ChevronRight size={18} />
          </div>
        </button>
      </motion.div>

      {/* ── Clear cart confirm dialog ─────────────────────────────────────── */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed inset-x-4 bottom-8 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2
                         sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
                         z-50 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl
                         sm:w-full sm:max-w-sm"
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-2xl
                                flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">Clear cart?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This will remove all {items.length} item{items.length > 1 ? 's' : ''} from your cart. This can't be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700
                             text-sm font-semibold text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600
                             text-sm font-bold text-white transition-colors
                             shadow-lg shadow-red-200 dark:shadow-red-900/30"
                >
                  Clear cart
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── CartItem ─────────────────────────────────────────────────────────────────

const CartItem = ({ item, index, onAdd, onRemove, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{
      opacity: 0, x: 40, height: 0,
      marginBottom: 0, paddingTop: 0, paddingBottom: 0,
    }}
    transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm
               flex items-center gap-4 group"
  >
    {/* Image */}
    <div className="w-16 h-16 shrink-0 bg-gray-50 dark:bg-gray-700 rounded-2xl
                    flex items-center justify-center text-3xl shadow-sm">
      {item.image ?? item.emoji}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="font-bold text-gray-900 dark:text-white text-sm truncate mb-0.5">
        {item.name}
      </p>
      {item.shopName && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{item.shopName}</p>
      )}
      <p className="text-sm font-extrabold text-red-500">₹{item.price}</p>
    </div>

    {/* Qty stepper */}
    <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20
                    rounded-xl px-1 py-0.5 shrink-0">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onRemove}
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   bg-red-500 hover:bg-red-600 text-white transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={12} />
      </motion.button>
      <motion.span
        key={item.qty}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="text-sm font-extrabold text-red-600 dark:text-red-400
                   min-w-[22px] text-center"
      >
        {item.qty}
      </motion.span>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onAdd}
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   bg-red-500 hover:bg-red-600 text-white transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={12} />
      </motion.button>
    </div>

    {/* Line total */}
    <div className="text-right shrink-0 min-w-[52px]">
      <motion.p
        key={item.qty}
        initial={{ scale: 1.15, color: '#ef4444' }}
        animate={{ scale: 1,    color: 'inherit' }}
        transition={{ duration: 0.25 }}
        className="font-extrabold text-gray-900 dark:text-white text-sm"
      >
        ₹{item.price * item.qty}
      </motion.p>
    </div>

    {/* Delete */}
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onDelete}
      className="p-2 rounded-xl text-gray-300 dark:text-gray-600
                 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
      aria-label="Remove item"
    >
      <Trash2 size={15} />
    </motion.button>
  </motion.div>
)

// ─── SummaryRow ───────────────────────────────────────────────────────────────

const SummaryRow = ({ label, value, valueClass = '' }) => (
  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
    <span>{label}</span>
    <span className={`font-semibold ${valueClass}`}>{value}</span>
  </div>
)

export default Cart

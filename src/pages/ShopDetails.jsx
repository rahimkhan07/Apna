import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Star, Clock, Bike, MapPin, Phone,
  Search, Heart, Share2, Plus, Minus, ShoppingCart,
  X, ChevronRight, Info, Leaf, Drumstick, AlertCircle,
} from 'lucide-react'
import { getShopById, getProductsByShop } from '../utils/seedStorage'
import useCartStore from '../store/useCartStore'
import useWishlistStore from '../store/useWishlistStore'
import useToastStore from '../store/useToastStore'
import Badge from '../components/ui/Badge'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract unique product categories, always starting with "All" */
const getCategories = (products) => [
  'All',
  ...Array.from(new Set(products.map((p) => p.category))),
]

/** Compute discount percentage */
const discountPct = (price, original) =>
  original > price ? Math.round(((original - price) / original) * 100) : 0

// ─── Main page ────────────────────────────────────────────────────────────────

/**
 * ShopDetails — /shop/:id
 *
 * Layout:
 *   • Full-width gradient hero banner with logo, back, wishlist, share
 *   • Shop info card (name, rating, delivery, address, discount)
 *   • Sticky category tab bar
 *   • Two-column on lg+: product list (left) + cart sidebar (right)
 *   • Sticky mobile cart bar at bottom
 *   • Cart-conflict dialog when user tries to add from a different shop
 */
const ShopDetails = () => {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [shop,         setShop]         = useState(null)
  const [products,     setProducts]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState('All')
  const [search,       setSearch]       = useState('')
  const [headerStuck,  setHeaderStuck]  = useState(false)
  const [showConflict, setShowConflict] = useState(false)
  const [pendingItem,  setPendingItem]  = useState(null)

  const tabBarRef  = useRef(null)
  const heroRef    = useRef(null)

  const {
    addItem, removeItem, itemQty,
    totalItems, totalPrice,
    shopId: cartShopId, shopName: cartShopName,
    clearCart,
  } = useCartStore()

  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const { cart: toastCart, info: toastInfo, success: toastSuccess } = useToastStore()

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setShop(getShopById(id))
      setProducts(getProductsByShop(id))
      setLoading(false)
    }, 700)
    return () => clearTimeout(t)
  }, [id])

  // ── Sticky header detection ────────────────────────────────────────────────
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const obs = new IntersectionObserver(
      ([entry]) => setHeaderStuck(!entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(hero)
    return () => obs.disconnect()
  }, [loading])

  // ── Add to cart with conflict guard ───────────────────────────────────────
  const handleAdd = useCallback((product) => {
    // If cart already has items from a different shop, show conflict dialog
    if (cartShopId && cartShopId !== id && totalItems() > 0) {
      setPendingItem(product)
      setShowConflict(true)
      return
    }
    addItem({ ...product, shopId: id, shopName: shop?.name })
    toastCart(`${product.name} added to cart`, { duration: 1800 })
  }, [cartShopId, id, totalItems, addItem, shop, toastCart])

  const confirmSwitch = () => {
    clearCart()
    addItem({ ...pendingItem, shopId: id, shopName: shop?.name })
    toastCart(`${pendingItem.name} added to cart`, { duration: 1800 })
    setShowConflict(false)
    setPendingItem(null)
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  if (loading) return <ShopDetailsSkeleton />

  if (!shop) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <span className="text-7xl block mb-5">😕</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Shop not found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          This shop may have moved or been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-red-500 font-semibold text-sm hover:text-red-600 transition-colors"
        >
          ← Go back
        </button>
      </div>
    )
  }

  const categories     = getCategories(products)
  const filteredProds  = products.filter((p) => {
    const tabMatch    = activeTab === 'All' || p.category === activeTab
    const searchMatch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.description?.toLowerCase().includes(search.toLowerCase())
    return tabMatch && searchMatch
  })

  const cartCount = totalItems()
  const cartTotal = totalPrice()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Sticky mini-header (appears after hero scrolls away) ─────────── */}
      <AnimatePresence>
        {headerStuck && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90
                       backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl">{shop.logo}</span>
                <span className="font-bold text-gray-900 dark:text-white truncate">{shop.name}</span>
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  shop.openStatus
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {shop.openStatus ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                <Star size={12} fill="#22c55e" className="text-green-500" />
                <span className="font-bold text-gray-900 dark:text-white">{shop.rating}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className={`relative h-56 sm:h-72 bg-gradient-to-br ${shop.banner} overflow-hidden`}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-black/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full" />

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2.5 rounded-2xl bg-black/20
                     hover:bg-black/35 backdrop-blur-sm text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Wishlist + Share */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleWishlist({ id: shop.id, name: shop.name, image: shop.logo })}
            className={`p-2.5 rounded-2xl backdrop-blur-sm transition-all ${
              isWishlisted(shop.id)
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                : 'bg-black/20 hover:bg-black/35 text-white'
            }`}
            aria-label={isWishlisted(shop.id) ? 'Remove from saved' : 'Save shop'}
          >
            <Heart size={18} fill={isWishlisted(shop.id) ? 'currentColor' : 'none'} />
          </motion.button>
          <button
            className="p-2.5 rounded-2xl bg-black/20 hover:bg-black/35 backdrop-blur-sm text-white transition-colors"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Big logo centered on banner bottom edge */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10
                     w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl
                     flex items-center justify-center text-5xl
                     ring-4 ring-white dark:ring-gray-800"
        >
          {shop.logo}
        </motion.div>
      </div>

      {/* ── Shop info card ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm"
        >
          {/* Name row */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {shop.name}
            </h1>
            <span className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              shop.openStatus
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                shop.openStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              {shop.openStatus ? 'Open Now' : 'Closed'}
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{shop.cuisine}</p>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
            {/* Rating */}
            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20
                            px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-900/40">
              <Star size={13} fill="#22c55e" className="text-green-500" />
              <span className="font-bold text-green-700 dark:text-green-400 text-sm">{shop.rating}</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs">
                ({shop.reviewCount?.toLocaleString('en-IN')} reviews)
              </span>
            </div>

            {/* Delivery time */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50
                            px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
              <Clock size={13} className="text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{shop.deliveryTime}</span>
            </div>

            {/* Delivery fee */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm ${
              shop.deliveryFee === 0
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-400'
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              <Bike size={13} className={shop.deliveryFee === 0 ? 'text-blue-500' : 'text-gray-400'} />
              {shop.deliveryFee === 0
                ? <span className="font-semibold">Free delivery</span>
                : <span>₹{shop.deliveryFee} delivery</span>}
            </div>

            {/* Min order */}
            {shop.minOrder > 0 && (
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50
                              px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <Info size={13} className="text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Min. ₹{shop.minOrder}
                </span>
              </div>
            )}
          </div>

          {/* Address + WhatsApp */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4
                          text-xs text-gray-500 dark:text-gray-400 pb-4
                          border-b border-gray-100 dark:border-gray-700">
            <span className="flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 shrink-0 text-gray-400" />
              {shop.address}
            </span>
            {shop.whatsappNumber && (
              <a
                href={`https://wa.me/${shop.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-green-600 dark:text-green-400
                           font-semibold hover:underline shrink-0"
              >
                <Phone size={12} /> Chat on WhatsApp
              </a>
            )}
          </div>

          {/* Tags */}
          {shop.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3">
              {shop.tags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Discount banner */}
          {shop.discount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50
                         dark:from-red-900/20 dark:to-orange-900/20
                         border border-red-200 dark:border-red-800/50
                         rounded-2xl px-4 py-3"
            >
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {shop.discount} on this order
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Applied automatically at checkout
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Main content: product list + desktop cart sidebar ────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-32 lg:pb-10 flex gap-6 items-start">

        {/* Left: search + tabs + products */}
        <div className="flex-1 min-w-0">

          {/* Search */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700 rounded-2xl
                          px-4 py-3 mb-4 shadow-sm
                          focus-within:ring-2 focus-within:ring-red-400/50
                          focus-within:border-red-400 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items…"
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200
                         placeholder-gray-400 outline-none"
              aria-label="Search menu"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X size={15} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Category tabs — sticky below the main navbar */}
          {categories.length > 1 && (
            <div
              ref={tabBarRef}
              className="sticky top-14 z-30 -mx-4 px-4 sm:mx-0 sm:px-0
                         bg-gray-50 dark:bg-gray-950 py-2 mb-4"
            >
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold
                                transition-all whitespace-nowrap ${
                      activeTab === cat
                        ? 'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-red-900/30'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-400 hover:text-red-500'
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Product count */}
          {!loading && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              {filteredProds.length} item{filteredProds.length !== 1 ? 's' : ''}
              {activeTab !== 'All' ? ` in ${activeTab}` : ''}
              {search ? ` matching "${search}"` : ''}
            </p>
          )}

          {/* Products list */}
          {filteredProds.length === 0 ? (
            <EmptyMenu search={search} onClear={() => { setSearch(''); setActiveTab('All') }} />
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredProds.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <ProductCard
                      product={product}
                      qty={itemQty(product.id)}
                      onAdd={() => handleAdd(product)}
                      onRemove={() => removeItem(product.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right: desktop cart sidebar */}
        <div className="hidden lg:block w-80 shrink-0 sticky top-24">
          <CartSidebar
            cartCount={cartCount}
            cartTotal={cartTotal}
            shopName={shop.name}
            onViewCart={() => navigate('/cart')}
          />
        </div>
      </div>

      {/* ── Mobile sticky cart bar ───────────────────────────────────────── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="lg:hidden fixed bottom-16 md:bottom-4 left-4 right-4 z-50"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/cart')}
              className="w-full flex items-center justify-between
                         bg-red-500 hover:bg-red-600 text-white
                         px-5 py-4 rounded-2xl
                         shadow-2xl shadow-red-400/40 dark:shadow-red-900/60
                         transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-600 rounded-xl w-7 h-7 flex items-center justify-center
                                text-sm font-bold shrink-0">
                  {cartCount}
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm leading-tight">View Cart</p>
                  <p className="text-red-200 text-xs">{shop.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">₹{cartTotal}</span>
                <ChevronRight size={18} />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart conflict dialog ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showConflict && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowConflict(false)}
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
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-2xl
                                flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    Start a new cart?
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your cart has items from{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {cartShopName}
                    </span>
                    . Adding from{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {shop.name}
                    </span>{' '}
                    will clear your current cart.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConflict(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700
                             text-sm font-semibold text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Keep current
                </button>
                <button
                  onClick={confirmSwitch}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600
                             text-sm font-bold text-white transition-colors
                             shadow-lg shadow-red-200 dark:shadow-red-900/30"
                >
                  Start fresh
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

/**
 * ProductCard — horizontal card with image, veg badge, description, price, qty controls.
 */
const ProductCard = ({ product, qty, onAdd, onRemove }) => {
  const pct = discountPct(product.price, product.originalPrice)

  return (
    <motion.div
      layout
      className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm
                  hover:shadow-md transition-shadow
                  ${!product.inStock ? 'opacity-60' : ''}`}
    >
      <div className="flex gap-0">

        {/* ── Left: text content ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">

          {/* Top: tag + name + description */}
          <div className="mb-3">
            {/* Veg / Non-veg indicator + tag */}
            <div className="flex items-center gap-2 mb-1.5">
              <VegBadge isVeg={product.isVeg} />
              {product.tag && (
                <Badge variant="warning" className="text-[10px]">{product.tag}</Badge>
              )}
            </div>

            <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base
                           leading-snug mb-1">
              {product.name}
            </h4>

            <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Bottom: price + add button */}
          <div className="flex items-center justify-between gap-2">
            {/* Price */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-extrabold text-gray-900 dark:text-white text-base">
                ₹{product.price}
              </span>
              {pct > 0 && (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">
                    {pct}% off
                  </span>
                </>
              )}
            </div>

            {/* Add / qty controls */}
            {!product.inStock ? (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium shrink-0">
                Out of stock
              </span>
            ) : qty === 0 ? (
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onAdd}
                className="shrink-0 flex items-center gap-1 bg-red-500 hover:bg-red-600
                           text-white text-xs font-bold px-3.5 py-2 rounded-xl
                           shadow-md shadow-red-200 dark:shadow-red-900/30
                           transition-colors"
                aria-label={`Add ${product.name}`}
              >
                <Plus size={13} /> ADD
              </motion.button>
            ) : (
              <div className="shrink-0 flex items-center gap-1.5
                              bg-red-50 dark:bg-red-900/20 rounded-xl px-1 py-0.5">
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
                  key={qty}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-extrabold text-red-600 dark:text-red-400
                             min-w-[22px] text-center"
                >
                  {qty}
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
            )}
          </div>
        </div>

        {/* ── Right: image ───────────────────────────────────────────────── */}
        <div className="relative w-28 sm:w-36 shrink-0 self-stretch
                        bg-gradient-to-br from-gray-50 to-gray-100
                        dark:from-gray-700 dark:to-gray-800
                        flex items-center justify-center overflow-hidden">
          <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300 select-none">
            {product.image}
          </span>

          {/* Discount ribbon */}
          {pct > 0 && (
            <div className="absolute top-2 right-0 bg-green-500 text-white
                            text-[10px] font-bold px-2 py-0.5 rounded-l-full shadow">
              {pct}% OFF
            </div>
          )}

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60
                            flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400
                               bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow">
                Unavailable
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── VegBadge ─────────────────────────────────────────────────────────────────

const VegBadge = ({ isVeg }) => (
  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold
                   border ${
                     isVeg
                       ? 'border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                       : 'border-red-600 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                   }`}>
    <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
    {isVeg ? 'VEG' : 'NON-VEG'}
  </div>
)

// ─── CartSidebar (desktop) ────────────────────────────────────────────────────

const CartSidebar = ({ cartCount, cartTotal, shopName, onViewCart }) => {
  const { items, addItem, removeItem, deleteItem } = useCartStore()

  if (cartCount === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm text-center">
        <span className="text-5xl block mb-3">🛒</span>
        <p className="font-semibold text-gray-900 dark:text-white mb-1">Your cart is empty</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Add items from the menu to get started
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">Your Order</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">{shopName}</span>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-3 space-y-3 max-h-72 overflow-y-auto">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-xl shrink-0">{item.image}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400">₹{item.price} × {item.qty}</p>
              </div>
              {/* Qty controls */}
              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 rounded-lg px-0.5 py-0.5">
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-5 h-5 flex items-center justify-center rounded-md
                             bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <Minus size={9} />
                </button>
                <span className="text-xs font-bold text-red-600 dark:text-red-400 w-4 text-center">
                  {item.qty}
                </span>
                <button
                  onClick={() => addItem(item)}
                  className="w-5 h-5 flex items-center justify-center rounded-md
                             bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <Plus size={9} />
                </button>
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0 w-12 text-right">
                ₹{item.price * item.qty}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>₹{cartTotal}</span>
        </div>
        <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
          <span>Delivery</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1
                        border-t border-gray-100 dark:border-gray-700">
          <span>Total</span>
          <span>₹{cartTotal}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onViewCart}
          className="w-full mt-2 py-3 bg-red-500 hover:bg-red-600 text-white font-bold
                     rounded-xl text-sm transition-colors shadow-lg shadow-red-200
                     dark:shadow-red-900/30 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          Proceed to Checkout
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyMenu = ({ search, onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-20"
  >
    <span className="text-6xl block mb-4">{search ? '🔍' : '🍽️'}</span>
    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
      {search ? `No results for "${search}"` : 'No items available'}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
      {search ? 'Try a different keyword or browse all categories.' : 'Check back later.'}
    </p>
    {search && (
      <button
        onClick={onClear}
        className="text-sm text-red-500 font-semibold hover:text-red-600 transition-colors"
      >
        Clear search
      </button>
    )}
  </motion.div>
)

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const ShopDetailsSkeleton = () => (
  <div className="animate-pulse">
    {/* Banner */}
    <div className="h-56 sm:h-72 bg-gray-200 dark:bg-gray-700" />

    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16">
      {/* Info card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm space-y-4 mb-6">
        <div className="flex justify-between">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-xl w-48" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36" />
        <div className="flex gap-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-24" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-28" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-32" />
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64" />
      </div>

      {/* Search skeleton */}
      <div className="h-12 bg-white dark:bg-gray-800 rounded-2xl mb-4 shadow-sm" />

      {/* Tab bar skeleton */}
      <div className="flex gap-2 mb-4">
        {[80, 100, 90, 110].map((w, i) => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Product skeletons */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm flex">
            <div className="flex-1 p-4 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-16" />
              </div>
            </div>
            <div className="w-28 sm:w-36 bg-gray-100 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default ShopDetails

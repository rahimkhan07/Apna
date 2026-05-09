import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, CheckCircle, ChefHat, Package,
  Bike, Home, Phone, MapPin, Copy, MessageCircle,
  RotateCcw, Star, Clock, Tag,
} from 'lucide-react'
import useOrderStore from '../store/useOrderStore'
import useCartStore from '../store/useCartStore'
import useToastStore from '../store/useToastStore'
import { getFromStorage, saveToStorage } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/seedData'
import { sendOrderViaWhatsApp } from '../utils/whatsapp'

// ─── Stage pipeline ───────────────────────────────────────────────────────────
const STAGES = [
  { key: 'confirmed',  label: 'Order Placed',      icon: CheckCircle, emoji: '✅', bg: 'bg-blue-500',   ring: 'ring-blue-300 dark:ring-blue-800',   desc: 'Your order has been received',       tip: 'Sit back and relax!' },
  { key: 'preparing',  label: 'Preparing',          icon: ChefHat,     emoji: '👨‍🍳', bg: 'bg-orange-500', ring: 'ring-orange-300 dark:ring-orange-800', desc: 'The kitchen is cooking your order',  tip: 'Fresh & hot, just for you' },
  { key: 'packed',     label: 'Packed',             icon: Package,     emoji: '📦', bg: 'bg-purple-500', ring: 'ring-purple-300 dark:ring-purple-800', desc: 'Your order is packed and ready',     tip: 'Almost there!' },
  { key: 'on_the_way', label: 'Out for Delivery',   icon: Bike,        emoji: '🛵', bg: 'bg-amber-500',  ring: 'ring-amber-300 dark:ring-amber-800',  desc: 'Rider is heading your way',          tip: 'Track your rider below' },
  { key: 'delivered',  label: 'Delivered',          icon: Home,        emoji: '🎉', bg: 'bg-green-500',  ring: 'ring-green-300 dark:ring-green-800',  desc: 'Order delivered successfully!',      tip: 'Enjoy your meal 😋' },
]

// Simulated auto-advance delays per stage (ms) — speeds through for demo
const STAGE_DELAYS = [5000, 8000, 6000, 10000]

const STAGE_KEYS = STAGES.map((s) => s.key)
const stageIdx   = (key) => Math.max(0, STAGE_KEYS.indexOf(key))

// Dummy rider
const RIDER = { name: 'Arjun Kumar', rating: 4.9, trips: 1284, emoji: '🧑‍🦱', phone: '9876500001', vehicle: 'Activa 6G · DL 4S AB 1234' }

// ─── Main component ───────────────────────────────────────────────────────────
const OrderTracking = () => {
  const { id }   = useParams()
  const navigate = useNavigate()

  const { orders, activeOrder, markWhatsAppSent } = useOrderStore()
  const { addItem, clearCart } = useCartStore()
  const { success, info }      = useToastStore()

  const [order,       setOrder]       = useState(null)
  const [currentKey,  setCurrentKey]  = useState('confirmed')
  const [copied,      setCopied]      = useState(false)
  const [secsLeft,    setSecsLeft]    = useState(35 * 60) // 35-min countdown
  const [simDone,     setSimDone]     = useState(false)   // stops auto-advance after delivered

  // ── Resolve order ──────────────────────────────────────────────────────
  useEffect(() => {
    const fromStore = orders.find((o) => o.id === id) ?? (activeOrder?.id === id ? activeOrder : null)
    if (fromStore) { setOrder(fromStore); setCurrentKey(fromStore.status); return }
    const all   = getFromStorage(STORAGE_KEYS.ORDERS, [])
    const found = all.find((o) => o.id === id)
    if (found) { setOrder(found); setCurrentKey(found.status) }
  }, [id, orders, activeOrder])

  // ── Persist status change to localStorage ─────────────────────────────
  const advanceStatus = useCallback((nextKey) => {
    setCurrentKey(nextKey)
    setOrder((prev) => prev ? { ...prev, status: nextKey } : prev)

    // Patch shared fh_orders
    const all = getFromStorage(STORAGE_KEYS.ORDERS, [])
    saveToStorage(STORAGE_KEYS.ORDERS, all.map((o) =>
      o.id === id ? { ...o, status: nextKey, ...(nextKey === 'delivered' ? { deliveredAt: new Date().toISOString() } : {}) } : o
    ))
  }, [id])

  // ── Simulated auto-advance through stages ──────────────────────────────
  useEffect(() => {
    if (!order || simDone) return
    const idx = stageIdx(currentKey)
    if (idx >= STAGES.length - 1) { setSimDone(true); return }

    const delay = STAGE_DELAYS[idx] ?? 6000
    const t = setTimeout(() => {
      const next = STAGE_KEYS[idx + 1]
      advanceStatus(next)
      if (next === 'delivered') setSimDone(true)
    }, delay)
    return () => clearTimeout(t)
  }, [order, currentKey, simDone, advanceStatus])

  // ── Delivery countdown timer ───────────────────────────────────────────
  useEffect(() => {
    if (currentKey === 'delivered') return
    const t = setInterval(() => setSecsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [currentKey])

  // ── Copy order ID ──────────────────────────────────────────────────────
  const copyId = () => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Re-send WhatsApp ───────────────────────────────────────────────────
  const resendWA = () => {
    if (!order) return
    sendOrderViaWhatsApp(order.shopWhatsapp ?? '919999999999', order)
    markWhatsAppSent(id)
    success('WhatsApp opened!')
  }

  // ── Reorder ────────────────────────────────────────────────────────────
  const handleReorder = () => {
    if (!order) return
    clearCart()
    order.items.forEach((item) => addItem({ id: item.productId, name: item.name, image: item.image, price: item.price, shopId: order.shopId, shopName: order.shopName }))
    info('Items added to cart!')
    navigate(`/shop/${order.shopId}`)
  }

  if (!order) return <NotFound id={id} />

  const idx         = stageIdx(currentKey)
  const stage       = STAGES[idx]
  const isCancelled = currentKey === 'cancelled'
  const isDelivered = currentKey === 'delivered'
  const showRider   = ['on_the_way', 'delivered'].includes(currentKey)

  const mm = String(Math.floor(secsLeft / 60)).padStart(2, '0')
  const ss = String(secsLeft % 60).padStart(2, '0')

  const placedDate = new Date(order.placedAt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Top header ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Back">
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-gray-900 dark:text-white text-sm leading-tight">Order Tracking</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">{id}</p>
          </div>
          <button onClick={copyId} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Copy order ID">
            {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4 pb-10">

        {/* ── Hero status card ──────────────────────────────────────────── */}
        {!isCancelled && (
          <motion.div
            key={currentKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-3xl p-6 text-white ${stage.bg} shadow-xl`}
          >
            {/* Background blobs */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-black/10 rounded-full" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                  {isDelivered ? 'Completed' : 'Live Status'}
                </p>
                <motion.h2
                  key={stage.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-extrabold leading-tight mb-1"
                >
                  {stage.label}
                </motion.h2>
                <p className="text-white/80 text-sm">{stage.desc}</p>
                <p className="text-white/60 text-xs mt-1 italic">{stage.tip}</p>
              </div>

              {/* Big emoji */}
              <motion.div
                key={stage.emoji}
                initial={{ scale: 0.4, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="text-6xl select-none"
              >
                {stage.emoji}
              </motion.div>
            </div>

            {/* Delivery timer — hidden once delivered */}
            {!isDelivered && (
              <div className="relative z-10 mt-5 flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3">
                <Clock size={18} className="text-white/80 shrink-0" />
                <div>
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">Estimated Delivery</p>
                  <p className="text-white font-extrabold text-lg leading-tight font-mono">
                    {mm}:{ss}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-white/70 text-[10px]">Placed at</p>
                  <p className="text-white text-xs font-semibold">{placedDate}</p>
                </div>
              </div>
            )}

            {/* Delivered celebration */}
            {isDelivered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 mt-4 bg-white/20 rounded-2xl px-4 py-3 text-center"
              >
                <p className="text-white font-bold text-sm">🎉 Delivered on time! Rate your experience</p>
                <div className="flex justify-center gap-1 mt-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={20} fill="white" className="text-white cursor-pointer hover:scale-110 transition-transform" />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Cancelled banner ──────────────────────────────────────────── */}
        {isCancelled && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-3xl p-5 flex items-center gap-4">
            <span className="text-4xl">❌</span>
            <div>
              <p className="font-extrabold text-red-700 dark:text-red-400 text-lg">Order Cancelled</p>
              <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">This order was cancelled. You can reorder below.</p>
            </div>
          </motion.div>
        )}

        {/* ── Horizontal step tracker ───────────────────────────────────── */}
        {!isCancelled && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm overflow-hidden">
            <h3 className="font-bold text-gray-900 dark:text-white mb-5 text-sm">Order Progress</h3>

            {/* Step icons row */}
            <div className="relative flex items-start justify-between">
              {/* Background connector line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 dark:bg-gray-700" />

              {/* Animated progress fill */}
              <motion.div
                className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-blue-500 via-orange-500 to-green-500 origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: idx / (STAGES.length - 1) }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ right: '20px' }}
              />

              {STAGES.map((s, i) => {
                const done   = i <= idx
                const active = i === idx
                const Icon   = s.icon
                return (
                  <div key={s.key} className="relative flex flex-col items-center gap-2 z-10" style={{ width: `${100 / STAGES.length}%` }}>
                    {/* Circle */}
                    <motion.div
                      animate={active ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center
                                  transition-all duration-500 ring-4 ${
                                    done
                                      ? `${s.bg} text-white shadow-lg ${s.ring}`
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 ring-transparent'
                                  }`}
                    >
                      {done && !active
                        ? <CheckCircle size={18} className="text-white" />
                        : <Icon size={16} />}
                    </motion.div>

                    {/* Pulse ring on active */}
                    {active && (
                      <motion.div
                        className={`absolute top-0 w-10 h-10 rounded-full ${s.bg} opacity-30`}
                        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    {/* Label */}
                    <p className={`text-center leading-tight transition-colors duration-300 ${
                      done ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400 dark:text-gray-500 font-medium'
                    }`} style={{ fontSize: '9px' }}>
                      {s.label}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Current stage description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-5 flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-4 py-3"
              >
                <span className="text-xl">{stage.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{stage.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stage.desc}</p>
                </div>
                {!isDelivered && (
                  <div className="ml-auto flex gap-1">
                    {[0,1,2].map((i) => (
                      <motion.div key={i} className={`w-1.5 h-1.5 rounded-full ${stage.bg}`}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Rider card (visible from on_the_way) ─────────────────────── */}
        <AnimatePresence>
          {showRider && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2">
                <Bike size={15} className="text-amber-500" /> Your Delivery Rider
              </h3>

              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
                    {RIDER.emoji}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-900 dark:text-white">{RIDER.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star size={12} fill="#f59e0b" className="text-amber-500" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{RIDER.rating}</span>
                    <span className="text-xs text-gray-400">· {RIDER.trips.toLocaleString()} trips</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{RIDER.vehicle}</p>
                </div>

                {/* Call button */}
                <a
                  href={`tel:${RIDER.phone}`}
                  className="shrink-0 w-11 h-11 bg-green-500 hover:bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-green-900/30 transition-colors"
                  aria-label="Call rider"
                >
                  <Phone size={18} />
                </a>
              </div>

              {/* Animated bike path */}
              {!isDelivered && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-4 py-3 overflow-hidden relative">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-1"><MapPin size={11} /> Restaurant</span>
                    <span className="flex items-center gap-1">Your location <MapPin size={11} className="text-red-500" /></span>
                  </div>
                  {/* Track */}
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      animate={{ width: ['20%', '85%'] }}
                      transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                    />
                    {/* Rider dot */}
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-[10px]"
                      animate={{ left: ['18%', '83%'] }}
                      transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                    >
                      🛵
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Shop + order info ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <span className="text-3xl">{order.shopLogo}</span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-900 dark:text-white">{order.shopName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{order.paymentMethod} · {placedDate}</p>
            </div>
            {order.shopWhatsapp && (
              <a href={`https://wa.me/${order.shopWhatsapp}`} target="_blank" rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold hover:underline">
                <Phone size={12} /> Shop
              </a>
            )}
          </div>

          {/* Delivery address */}
          <div className="space-y-1.5 text-sm mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <MapPin size={13} className="text-red-500 shrink-0" /> {order.customer?.name}
            </p>
            <p className="text-gray-500 dark:text-gray-400 pl-5">{order.customer?.address}</p>
            {order.customer?.phone && (
              <p className="text-gray-400 dark:text-gray-500 pl-5 flex items-center gap-1.5 text-xs">
                <Phone size={11} /> {order.customer.phone}
              </p>
            )}
          </div>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {order.items.map((item) => (
              <div key={item.productId ?? item.name} className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl">
                  {item.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">₹{item.price} × {item.qty}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>

          {/* Bill summary */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span><span>₹{order.subtotal}</span>
            </div>
            <div className={`flex justify-between ${order.deliveryFee === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span className="flex items-center gap-1"><Tag size={11} /> {order.couponCode}</span>
                <span>− ₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-100 dark:border-gray-700">
              <span>Total Paid</span><span>₹{order.total}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3">
          <button onClick={resendWA}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow-lg shadow-green-200 dark:shadow-green-900/30">
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={handleReorder}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-sm border-2 border-gray-200 dark:border-gray-700 hover:border-red-400 transition-colors">
            <RotateCcw size={16} /> Reorder
          </button>
        </motion.div>

        <div className="text-center pt-1">
          <Link to="/" className="text-sm text-red-500 hover:text-red-600 font-semibold transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Not found ────────────────────────────────────────────────────────────────
const NotFound = ({ id }) => (
  <div className="max-w-md mx-auto px-4 py-24 text-center">
    <span className="text-7xl block mb-5">🔍</span>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order not found</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
      We couldn't find order <span className="font-mono font-bold">{id}</span>.
    </p>
    <Link to="/orders" className="text-red-500 font-semibold text-sm hover:text-red-600">
      View all orders →
    </Link>
  </div>
)

export default OrderTracking

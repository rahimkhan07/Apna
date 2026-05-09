import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, X, ChevronDown, RotateCcw, Eye,
  Clock, CheckCircle, XCircle, Package, Bike,
  ShoppingBag, MapPin, Phone, Tag, Calendar,
  ChevronRight, AlertCircle, Copy,
} from 'lucide-react'
import useOrderStore from '../store/useOrderStore'
import useAuthStore from '../store/useAuthStore'
import useCartStore from '../store/useCartStore'
import useToastStore from '../store/useToastStore'
import { getFromStorage } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/seedData'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:    { label: 'Pending',        icon: Clock,        badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
  confirmed:  { label: 'Confirmed',      icon: Package,      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  preparing:  { label: 'Preparing',      icon: Package,      badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
  on_the_way: { label: 'Out for Delivery', icon: Bike,       badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  delivered:  { label: 'Delivered',      icon: CheckCircle,  badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  cancelled:  { label: 'Cancelled',      icon: XCircle,      badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
}

const ACTIVE_STATUSES   = ['confirmed', 'preparing', 'on_the_way', 'pending']
const PAST_STATUSES     = ['delivered', 'cancelled']
const FILTER_OPTIONS    = ['All', 'Active', 'Delivered', 'Cancelled']
const DATE_FILTER_OPTS  = ['Any time', 'Today', 'Last 7 days', 'Last 30 days']

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) => new Date(iso).toLocaleString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
})

const isWithin = (iso, days) => {
  if (!days) return true
  const diff = (Date.now() - new Date(iso).getTime()) / 86400000
  return diff <= days
}

const dayMap = { Today: 1, 'Last 7 days': 7, 'Last 30 days': 30, 'Any time': null }

// ─── Main component ───────────────────────────────────────────────────────────
const Orders = () => {
  const navigate  = useNavigate()
  const { orders, loading, loadUserOrders, cancelOrder, reorder } = useOrderStore()
  const { user }  = useAuthStore()
  const { addItem, clearCart } = useCartStore()
  const { success, info, error: toastError } = useToastStore()

  const [search,      setSearch]      = useState('')
  const [statusFilter,setStatusFilter]= useState('All')
  const [dateFilter,  setDateFilter]  = useState('Any time')
  const [dateOpen,    setDateOpen]    = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null) // for detail modal

  // Load all orders from localStorage on mount
  useEffect(() => {
    loadUserOrders(user?.id ?? 'user-1')
  }, [user?.id, loadUserOrders])

  // ── Filtered + searched list ───────────────────────────────────────────
  const filtered = useMemo(() => {
    const days = dayMap[dateFilter]
    return orders.filter((o) => {
      // Status filter
      if (statusFilter === 'Active'    && !ACTIVE_STATUSES.includes(o.status))  return false
      if (statusFilter === 'Delivered' && o.status !== 'delivered')              return false
      if (statusFilter === 'Cancelled' && o.status !== 'cancelled')              return false
      // Date filter
      if (!isWithin(o.placedAt, days)) return false
      // Search
      if (search.trim()) {
        const q = search.toLowerCase()
        const inId    = o.id?.toLowerCase().includes(q)
        const inShop  = o.shopName?.toLowerCase().includes(q)
        const inItems = o.items?.some((i) => i.name?.toLowerCase().includes(q))
        if (!inId && !inShop && !inItems) return false
      }
      return true
    })
  }, [orders, statusFilter, dateFilter, search])

  const activeOrders = filtered.filter((o) => ACTIVE_STATUSES.includes(o.status))
  const pastOrders   = filtered.filter((o) => PAST_STATUSES.includes(o.status))

  // ── Reorder ────────────────────────────────────────────────────────────
  const handleReorder = (orderId) => {
    const items = reorder(orderId)
    if (!items?.length) { toastError('Could not reorder'); return }
    clearCart()
    items.forEach((item) => addItem({
      id: item.productId, name: item.name, image: item.image,
      price: item.price, shopId: items[0]?.shopId, shopName: items[0]?.shopName,
    }))
    success('Items added to cart!')
    navigate('/cart')
  }

  // ── Cancel ─────────────────────────────────────────────────────────────
  const handleCancel = (orderId) => {
    cancelOrder(orderId)
    info('Order cancelled')
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: 'cancelled' } : prev)
    }
  }

  // ── Copy order ID ──────────────────────────────────────────────────────
  const copyId = (id) => {
    navigator.clipboard.writeText(id).then(() => info('Order ID copied!'))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
            My Orders
          </h1>

          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 mb-3 focus-within:ring-2 focus-within:ring-red-400/50 focus-within:border-red-400 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, shop, or item..."
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {/* Status tabs */}
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === f
                    ? 'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-red-900/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f}
              </button>
            ))}

            {/* Date filter dropdown */}
            <div className="relative shrink-0 ml-auto">
              <button
                onClick={() => setDateOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Calendar size={12} />
                {dateFilter}
                <ChevronDown size={12} className={`transition-transform ${dateOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {dateOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-w-[140px]"
                  >
                    {DATE_FILTER_OPTS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setDateFilter(opt); setDateOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                          dateFilter === opt
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Order lists ───────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-6">

        {filtered.length === 0 ? (
          <EmptyState search={search} onClear={() => { setSearch(''); setStatusFilter('All'); setDateFilter('Any time') }} />
        ) : (
          <>
            {/* Active orders */}
            {activeOrders.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Active Orders ({activeOrders.length})
                </h2>
                <div className="space-y-3">
                  {activeOrders.map((order, i) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={i}
                      onView={() => setSelectedOrder(order)}
                      onTrack={() => navigate(`/order/${order.id}`)}
                      onReorder={() => handleReorder(order.id)}
                      onCancel={() => handleCancel(order.id)}
                      onCopyId={() => copyId(order.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past orders */}
            {pastOrders.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Order History ({pastOrders.length})
                </h2>
                <div className="space-y-3">
                  {pastOrders.map((order, i) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={i}
                      onView={() => setSelectedOrder(order)}
                      onTrack={() => navigate(`/order/${order.id}`)}
                      onReorder={() => handleReorder(order.id)}
                      onCancel={() => handleCancel(order.id)}
                      onCopyId={() => copyId(order.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Order detail modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onTrack={() => { setSelectedOrder(null); navigate(`/order/${selectedOrder.id}`) }}
            onReorder={() => { setSelectedOrder(null); handleReorder(selectedOrder.id) }}
            onCancel={() => handleCancel(selectedOrder.id)}
            onCopyId={() => copyId(selectedOrder.id)}
          />
        )}
      </AnimatePresence>

      {/* Close date dropdown on outside click */}
      {dateOpen && <div className="fixed inset-0 z-20" onClick={() => setDateOpen(false)} />}
    </div>
  )
}

// ─── OrderCard ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, index, onView, onTrack, onReorder, onCancel, onCopyId }) => {
  const cfg        = STATUS_CFG[order.status] ?? STATUS_CFG.pending
  const Icon       = cfg.icon
  const isActive   = ACTIVE_STATUSES.includes(order.status)
  const canCancel  = ['pending', 'confirmed'].includes(order.status)
  const itemsLabel = order.items?.map((i) => `${i.name} x${i.qty}`).join(', ') ?? ''

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Active indicator strip */}
      {isActive && (
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-400 to-amber-400" />
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 shrink-0 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              {order.shopLogo ?? '🍽️'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{order.shopName}</p>
              <button
                onClick={onCopyId}
                className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-mono"
              >
                {order.id}
                <Copy size={10} />
              </button>
            </div>
          </div>

          {/* Status badge */}
          <span className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
            <Icon size={10} />
            {cfg.label}
          </span>
        </div>

        {/* Items */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {itemsLabel}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={11} /> {fmtDate(order.placedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Tag size={11} /> {order.paymentMethod}
          </span>
        </div>

        {/* Footer: amount + actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div>
            <span className="font-extrabold text-gray-900 dark:text-white">₹{order.total}</span>
            {order.discount > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400 ml-1.5 font-medium">
                saved ₹{order.discount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View details */}
            <button
              onClick={onView}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-semibold transition-colors"
            >
              <Eye size={13} /> Details
            </button>

            {/* Track (active only) */}
            {isActive && (
              <button
                onClick={onTrack}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-bold transition-colors"
              >
                Track <ChevronRight size={13} />
              </button>
            )}

            {/* Cancel (if eligible) */}
            {canCancel && (
              <button
                onClick={onCancel}
                className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
              >
                Cancel
              </button>
            )}

            {/* Reorder (past orders) */}
            {!isActive && (
              <button
                onClick={onReorder}
                className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm shadow-red-200 dark:shadow-red-900/30"
              >
                <RotateCcw size={11} /> Reorder
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

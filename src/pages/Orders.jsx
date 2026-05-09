import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle, Package, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import useOrderStore from '../store/useOrderStore'
import useAuthStore from '../store/useAuthStore'
import useCartStore from '../store/useCartStore'

const statusConfig = {
  pending:     { label: 'Pending',     icon: Clock,         color: 'warning' },
  confirmed:   { label: 'Confirmed',   icon: Package,       color: 'purple'  },
  preparing:   { label: 'Preparing',   icon: Package,       color: 'purple'  },
  on_the_way:  { label: 'On the way',  icon: Clock,         color: 'warning' },
  delivered:   { label: 'Delivered',   icon: CheckCircle,   color: 'success' },
  cancelled:   { label: 'Cancelled',   icon: XCircle,       color: 'primary' },
}

/**
 * Orders page — reads live order history from useOrderStore (localStorage-backed)
 */
const Orders = () => {
  const { orders, loading, loadUserOrders, cancelOrder, reorder } = useOrderStore()
  const { user } = useAuthStore()
  const { addItem, clearCart } = useCartStore()

  // Load orders for the current user (falls back to user-1 for demo)
  useEffect(() => {
    loadUserOrders(user?.id ?? 'user-1')
  }, [user?.id, loadUserOrders])

  const handleReorder = (orderId) => {
    const items = reorder(orderId)
    if (!items) return
    clearCart()
    items.forEach((item) =>
      addItem({ ...item, id: item.productId, qty: undefined })
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        Loading orders…
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <span className="text-7xl block mb-6">📦</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Your order history will appear here once you place your first order.
          </p>
          <Link to="/"><Button variant="primary" size="lg">Start Ordering</Button></Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6"
      >
        📦 My Orders
      </motion.h1>

      <div className="space-y-4">
        {orders.map((order, i) => {
          const cfg = statusConfig[order.status] ?? statusConfig.pending
          const canCancel = ['pending', 'confirmed'].includes(order.status)

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{order.shopLogo}</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{order.shopName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {order.id} · {new Date(order.placedAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant={cfg.color}>
                  <cfg.icon size={10} className="mr-1" />
                  {cfg.label}
                </Badge>
              </div>

              {/* Items */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">₹{order.total}</span>
                  <span className="text-xs text-gray-400 ml-2">{order.paymentMethod}</span>
                </div>
                <div className="flex gap-2">
                  {canCancel && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="text-xs text-red-500 font-semibold hover:text-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleReorder(order.id)}
                    className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-600 transition-colors"
                  >
                    <RotateCcw size={12} /> Reorder
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Orders

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Store, Users, DollarSign } from 'lucide-react'
import { getShops, getOrders, getUsers, getProducts } from '../utils/seedStorage'

const statusColors = {
  delivered:   'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  on_the_way:  'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  preparing:   'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
  confirmed:   'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
  pending:     'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400',
  cancelled:   'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
}

const statusLabel = {
  delivered: 'Delivered', on_the_way: 'On the way', preparing: 'Preparing',
  confirmed: 'Confirmed', pending: 'Pending', cancelled: 'Cancelled',
}

/**
 * Admin page — reads live data from localStorage via seedStorage helpers
 */
const Admin = () => {
  // Read from localStorage on each render (lightweight for dummy data)
  const shops    = useMemo(() => getShops(),    [])
  const orders   = useMemo(() => getOrders(),   [])
  const users    = useMemo(() => getUsers(),    [])
  const products = useMemo(() => getProducts(), [])

  const revenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0)

  const stats = [
    { label: 'Total Orders',   value: orders.length,   change: '+12%', icon: ShoppingBag, color: 'bg-blue-500'   },
    { label: 'Active Shops',   value: shops.filter((s) => s.openStatus).length, change: `${shops.length} total`, icon: Store, color: 'bg-green-500' },
    { label: 'Revenue (delivered)', value: `₹${revenue.toLocaleString('en-IN')}`, change: 'all time', icon: DollarSign, color: 'bg-purple-500' },
    { label: 'Total Users',    value: users.length,    change: `${products.length} products`, icon: Users, color: 'bg-orange-500' },
  ]

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))
    .slice(0, 8)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
          ⚙️ Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Live data from localStorage · {orders.length} orders · {shops.length} shops
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent orders table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
          <span className="text-xs text-gray-400">{recentOrders.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Shop</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {order.id}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                      <span>{order.shopLogo}</span> {order.shopName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                    {order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    ₹{order.total}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] ?? ''}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default Admin

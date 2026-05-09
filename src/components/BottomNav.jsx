import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, UtensilsCrossed, Coffee, Candy, ShoppingCart } from 'lucide-react'
import useCartStore from '../store/useCartStore'

const navItems = [
  { label: 'Home',        path: '/',            icon: Home,            isCart: false },
  { label: 'Restaurants', path: '/restaurants', icon: UtensilsCrossed, isCart: false },
  { label: 'Cafes',       path: '/cafes',       icon: Coffee,          isCart: false },
  { label: 'Sweets',      path: '/sweet-shops', icon: Candy,           isCart: false },
  { label: 'Cart',        path: null,           icon: ShoppingCart,    isCart: true  },
]

/**
 * BottomNav — mobile-only sticky bottom navigation bar.
 *
 * Props:
 *   onCartOpen — () => void   opens the CartDrawer (passed from MainLayout)
 */
const BottomNav = ({ onCartOpen }) => {
  const totalItems = useCartStore((s) => s.totalItems())

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50
                 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800
                 shadow-2xl"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ label, path, icon: Icon, isCart }) => {

          // ── Cart tab — button that opens the drawer ──────────────────
          if (isCart) {
            return (
              <button
                key="cart"
                onClick={onCartOpen}
                aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1
                           rounded-xl text-gray-400 dark:text-gray-500
                           hover:text-red-500 transition-colors"
              >
                <span className="relative">
                  <ShoppingCart size={20} strokeWidth={1.8} />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{   scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white
                                   text-[9px] font-extrabold min-w-[14px] h-3.5
                                   flex items-center justify-center rounded-full px-0.5"
                      >
                        {totalItems > 99 ? '99+' : totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span className="text-[10px] font-medium">Cart</span>
              </button>
            )
          }

          // ── Regular nav tab ──────────────────────────────────────────
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 px-3 py-1
                 rounded-xl transition-colors ${
                   isActive
                     ? 'text-red-500'
                     : 'text-gray-400 dark:text-gray-500'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute inset-0 bg-red-50 dark:bg-red-900/20 rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </span>
                  <span className="relative text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav

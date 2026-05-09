import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Sun, Moon, Menu, X, MapPin, ChevronDown,
} from 'lucide-react'
import useThemeStore from '../store/useThemeStore'
import useCartStore from '../store/useCartStore'
import { navLinks } from '../utils/dummyData'

/**
 * Navbar
 *
 * Props:
 *   onCartOpen — () => void   opens the CartDrawer
 */
const Navbar = ({ onCartOpen }) => {
  const { isDark, toggleTheme } = useThemeStore()
  const totalItems = useCartStore((s) => s.totalItems())
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
                       border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500
                             bg-clip-text text-transparent">
              FoodieHub
            </span>
          </Link>

          {/* ── Location pill ─────────────────────────────────────────── */}
          <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                             text-sm text-gray-600 dark:text-gray-300 hover:border-red-400
                             transition-colors">
            <MapPin size={14} className="text-red-500" />
            <span className="max-w-[120px] truncate font-medium">New Delhi</span>
            <ChevronDown size={14} />
          </button>

          {/* ── Desktop nav links ─────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right actions ─────────────────────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart button — opens drawer */}
            <button
              onClick={onCartOpen}
              aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
              className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart size={20} />

              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{   scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white
                               text-[10px] font-extrabold min-w-[18px] h-[18px]
                               flex items-center justify-center rounded-full px-0.5
                               shadow-md shadow-red-300 dark:shadow-red-900/50"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown ───────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white dark:bg-gray-900
                       border-t border-gray-100 dark:border-gray-800"
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Cart link in mobile menu */}
              <button
                onClick={() => { setMenuOpen(false); onCartOpen?.() }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                           text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                           transition-colors text-left"
              >
                <ShoppingCart size={16} />
                Cart
                {totalItems > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold
                                   px-1.5 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar

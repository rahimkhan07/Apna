import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import CartDrawer from '../components/cart/CartDrawer'
import ToastContainer from '../components/ui/ToastContainer'

/**
 * MainLayout
 *
 * Owns the CartDrawer open/close state so both the Navbar cart button
 * and the BottomNav cart tab can open it.
 * Also mounts the global ToastContainer (renders outside the page flow).
 */
const MainLayout = () => {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white
                    transition-colors duration-300">

      {/* Global toast notifications */}
      <ToastContainer />

      {/* Cart drawer — rendered at layout level so it overlays everything */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <Navbar onCartOpen={() => setCartOpen(true)} />

      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>

      <Footer />

      {/* Pass drawer opener to BottomNav so the cart tab opens the drawer */}
      <BottomNav onCartOpen={() => setCartOpen(true)} />
    </div>
  )
}

export default MainLayout

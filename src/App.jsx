import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Restaurants from './pages/Restaurants'
import Cafes from './pages/Cafes'
import SweetShops from './pages/SweetShops'
import ShopDetails from './pages/ShopDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import Orders from './pages/Orders'
import Admin from './pages/Admin'
import useThemeStore from './store/useThemeStore'

/**
 * App — root component, sets up routing and initialises theme on mount
 */
const App = () => {
  const initTheme = useThemeStore((s) => s.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/"            element={<Home />}          />
          <Route path="/restaurants" element={<Restaurants />}   />
          <Route path="/cafes"       element={<Cafes />}         />
          <Route path="/sweet-shops" element={<SweetShops />}    />
          <Route path="/shop/:id"    element={<ShopDetails />}   />
          <Route path="/cart"        element={<Cart />}          />
          <Route path="/checkout"    element={<Checkout />}      />
          <Route path="/order/:id"   element={<OrderTracking />} />
          <Route path="/orders"      element={<Orders />}        />
          <Route path="/admin"       element={<Admin />}         />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

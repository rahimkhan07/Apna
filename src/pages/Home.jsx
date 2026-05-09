import { useState, useEffect } from 'react'
import HeroBanner from '../components/home/HeroBanner'
import SearchBar from '../components/home/SearchBar'
import CategoriesSection from '../components/home/CategoriesSection'
import FeaturedShops from '../components/home/FeaturedShops'
import TrendingProducts from '../components/home/TrendingProducts'
import OfferBanners from '../components/home/OfferBanners'

/**
 * Home — main landing page assembling all sections
 * Simulates a brief loading state to showcase skeleton loaders
 */
const Home = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch delay
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="pb-8">
      <HeroBanner />
      <SearchBar />
      <CategoriesSection />
      <FeaturedShops loading={loading} />
      <TrendingProducts loading={loading} />
      <OfferBanners />
    </div>
  )
}

export default Home

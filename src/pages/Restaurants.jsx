import ShopListingPage from '../components/shop/ShopListingPage'

const Restaurants = () => (
  <ShopListingPage
    category="restaurant"
    title="Restaurants"
    emoji="🍽️"
    emptyMsg="No restaurants available in your area right now."
  />
)

export default Restaurants

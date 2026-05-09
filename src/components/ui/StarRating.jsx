import { Star } from 'lucide-react'

/**
 * StarRating — displays a numeric rating with a star icon
 */
const StarRating = ({ rating, reviews, size = 'sm' }) => {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const iconSize = size === 'sm' ? 12 : 14

  return (
    <span className={`inline-flex items-center gap-1 ${textSize} font-semibold text-amber-500`}>
      <Star size={iconSize} fill="currentColor" />
      {rating}
      {reviews && (
        <span className="text-gray-400 dark:text-gray-500 font-normal">
          ({reviews.toLocaleString()})
        </span>
      )}
    </span>
  )
}

export default StarRating

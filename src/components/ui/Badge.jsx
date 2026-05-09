/**
 * Badge — small label chip used on cards and tags
 */
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default:  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    success:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    warning:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    purple:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
        ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge

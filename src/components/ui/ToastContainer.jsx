import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import useToastStore from '../../store/useToastStore'

/**
 * ToastContainer — renders all active toasts in a fixed portal at top-right.
 * Mount once inside MainLayout.
 */

const typeStyles = {
  success: 'bg-green-500  text-white',
  error:   'bg-red-500    text-white',
  warning: 'bg-amber-500  text-white',
  info:    'bg-blue-500   text-white',
  cart:    'bg-gray-900   text-white dark:bg-gray-700',
  default: 'bg-gray-900   text-white dark:bg-gray-700',
}

const ToastContainer = () => {
  const { toasts, dismiss } = useToastStore()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0,  scale: 1   }}
            exit={{   opacity: 0, x: 60,  scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3
                        rounded-2xl shadow-2xl min-w-[220px] max-w-[320px]
                        ${typeStyles[t.type] ?? typeStyles.default}`}
            role="alert"
          >
            {t.icon && (
              <span className="text-lg shrink-0 leading-none">{t.icon}</span>
            )}
            <p className="flex-1 text-sm font-semibold leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer

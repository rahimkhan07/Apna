import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, User, Phone, MapPin, MessageSquare,
  ShoppingBag, Tag, Bike, ChevronRight,
  MessageCircle, CreditCard, Banknote, Wallet,
  CheckCircle, AlertCircle, Edit2,
} from 'lucide-react'
import useCartStore from '../store/useCartStore'
import useOrderStore from '../store/useOrderStore'
import useToastStore from '../store/useToastStore'
import { getShopById } from '../utils/seedStorage'
import { sendOrderViaWhatsApp } from '../utils/whatsapp'

// ─── Payment methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'whatsapp', label: 'WhatsApp Order', icon: MessageCircle, desc: 'Send order via WhatsApp', color: 'text-green-600 dark:text-green-400' },
  { id: 'upi',      label: 'UPI',            icon: Wallet,        desc: 'Pay via UPI / QR code',  color: 'text-purple-600 dark:text-purple-400' },
  { id: 'card',     label: 'Card',           icon: CreditCard,    desc: 'Credit / Debit card',    color: 'text-blue-600 dark:text-blue-400' },
  { id: 'cod',      label: 'Cash on Delivery', icon: Banknote,    desc: 'Pay when delivered',     color: 'text-amber-600 dark:text-amber-400' },
]

// ─── Field validation ─────────────────────────────────────────────────────────
const validate = (form) => {
  const errors = {}
  if (!form.name.trim())    errors.name    = 'Name is required'
  if (!form.phone.trim())   errors.phone   = 'Phone number is required'
  else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, '')))
                            errors.phone   = 'Enter a valid 10-digit number'
  if (!form.address.trim()) errors.address = 'Delivery address is required'
  return errors
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Checkout — /checkout
 *
 * Collects customer info, shows order summary, handles payment method
 * selection, places the order, opens WhatsApp, clears cart, and
 * redirects to /order/:id for tracking.
 */
const Checkout = () => {
  const navigate  = useNavigate()

  const {
    items, shopId, shopName,
    subtotal, deliveryFee, discount, grandTotal, coupon,
    clearCart,
  } = useCartStore()

  const { placeOrder, markWhatsAppSent } = useOrderStore()
  const { success, error: toastError }   = useToastStore()

  const shop = shopId ? getShopById(shopId) : null

  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    address: '',
    notes:   '',
  })
  const [paymentMethod, setPaymentMethod] = useState('whatsapp')
  const [errors,        setErrors]        = useState({})
  const [placing,       setPlacing]       = useState(false)
  const [step,          setStep]          = useState(1) // 1 = details, 2 = review

  // Guard: redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <span className="text-7xl block mb-5">🛒</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Your cart is empty
        </h2>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600
                     text-white font-bold rounded-2xl text-sm transition-colors"
        >
          <ShoppingBag size={16} /> Explore Food
        </Link>
      </div>
    )
  }

  const sub   = subtotal()
  const fee   = deliveryFee()
  const disc  = discount()
  const total = grandTotal()

  // ── Field change ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  // ── Step 1 → Step 2 ─────────────────────────────────────────────────────
  const handleContinue = (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Place order ──────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setPlacing(true)

    // Build order object
    const order = placeOrder({
      shopId:        shopId ?? 'unknown',
      shopName:      shopName ?? shop?.name ?? 'Unknown Shop',
      shopLogo:      shop?.logo ?? '🍽️',
      shopWhatsapp:  shop?.whatsappNumber ?? null,

      customer: {
        name:    form.name.trim(),
        phone:   form.phone.trim(),
        address: form.address.trim(),
        notes:   form.notes.trim(),
      },

      items: items.map((i) => ({
        productId: i.id,
        name:      i.name,
        image:     i.image ?? i.emoji ?? '🍽️',
        price:     i.price,
        qty:       i.qty,
        isVeg:     i.isVeg ?? true,
      })),

      subtotal:      sub,
      deliveryFee:   fee,
      discount:      disc,
      couponCode:    coupon?.code ?? null,
      total,
      paymentMethod: PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label ?? paymentMethod,
    })

    // Open WhatsApp if that payment method is selected OR if shop has a number
    const whatsappTarget = shop?.whatsappNumber ?? '919999999999'
    if (paymentMethod === 'whatsapp' || shop?.whatsappNumber) {
      try {
        sendOrderViaWhatsApp(whatsappTarget, order)
        markWhatsAppSent(order.id)
      } catch {
        // WhatsApp open failed silently — order is still saved
      }
    }

    // Clear cart
    clearCart()

    success('Order placed successfully! 🎉', { duration: 4000 })

    setPlacing(false)

    // Navigate to order tracking
    navigate(`/order/${order.id}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800
                      sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => step === 2 ? setStep(1) : navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="font-extrabold text-gray-900 dark:text-white text-lg">
            {step === 1 ? 'Delivery Details' : 'Review & Place Order'}
          </h1>

          {/* Step indicator */}
          <div className="ml-auto flex items-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step
                    ? 'bg-red-500 w-8'
                    : 'bg-gray-200 dark:bg-gray-700 w-4'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: form / review ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Customer details ─────────────────────────────── */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleContinue}
                noValidate
                className="space-y-4"
              >
                <SectionCard title="Your Details" icon={User}>
                  <Field
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="Rahul Sharma"
                    icon={User}
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    autoComplete="name"
                  />
                  <Field
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    icon={Phone}
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    autoComplete="tel"
                    hint="We'll send order updates on this number"
                  />
                </SectionCard>

                <SectionCard title="Delivery Address" icon={MapPin}>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                      Full Address *
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House / Flat no., Street, Area, City, Pincode"
                      rows={3}
                      className={`w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700/50
                                  border rounded-xl text-gray-700 dark:text-gray-200
                                  placeholder-gray-400 resize-none
                                  focus:outline-none focus:ring-2 focus:ring-red-400/50
                                  focus:border-red-400 transition-all ${
                                    errors.address
                                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                                      : 'border-gray-200 dark:border-gray-600'
                                  }`}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.address}
                      </p>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="Order Notes" icon={MessageSquare} optional>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                      Special instructions (optional)
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="e.g. No onions, extra spicy, ring the bell…"
                      rows={2}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700/50
                                 border border-gray-200 dark:border-gray-600 rounded-xl
                                 text-gray-700 dark:text-gray-200 placeholder-gray-400
                                 resize-none focus:outline-none focus:ring-2
                                 focus:ring-red-400/50 focus:border-red-400 transition-all"
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Payment Method" icon={CreditCard}>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left
                                    transition-all ${
                                      paymentMethod === pm.id
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                      >
                        <pm.icon size={18} className={paymentMethod === pm.id ? 'text-red-500' : pm.color} />
                        <div>
                          <p className={`text-xs font-bold ${
                            paymentMethod === pm.id
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {pm.label}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                            {pm.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-extrabold
                             rounded-2xl text-base transition-colors shadow-xl shadow-red-200
                             dark:shadow-red-900/30 flex items-center justify-center gap-2"
                >
                  Review Order <ChevronRight size={18} />
                </motion.button>
              </motion.form>
            )}

            {/* ── STEP 2: Review & confirm ─────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Delivery info summary */}
                <SectionCard title="Delivering to" icon={MapPin}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-gray-900 dark:text-white">{form.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Phone size={12} /> {form.phone}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                        <MapPin size={12} className="mt-0.5 shrink-0" /> {form.address}
                      </p>
                      {form.notes && (
                        <p className="text-gray-400 dark:text-gray-500 text-xs italic">
                          "{form.notes}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                                 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Edit details"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </SectionCard>

                {/* Order items */}
                <SectionCard title={`Order from ${shopName}`} icon={ShoppingBag}>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 bg-gray-50 dark:bg-gray-700
                                        rounded-xl flex items-center justify-center text-xl">
                          {item.image ?? item.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400">₹{item.price} × {item.qty}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                          ₹{item.price * item.qty}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Payment method */}
                <SectionCard title="Payment" icon={CreditCard}>
                  {(() => {
                    const pm = PAYMENT_METHODS.find((p) => p.id === paymentMethod)
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <pm.icon size={18} className={pm.color} />
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{pm.label}</p>
                            <p className="text-xs text-gray-400">{pm.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setStep(1)}
                          className="text-xs text-red-500 font-semibold hover:text-red-600 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    )
                  })()}
                </SectionCard>

                {/* WhatsApp notice */}
                {(paymentMethod === 'whatsapp' || shop?.whatsappNumber) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20
                               border border-green-200 dark:border-green-800/50
                               rounded-2xl px-4 py-3"
                  >
                    <MessageCircle size={18} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Your order will be sent to{' '}
                      <strong>{shopName}</strong> via WhatsApp. Please confirm
                      when the shop responds.
                    </p>
                  </motion.div>
                )}

                {/* Place order button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:opacity-70
                             text-white font-extrabold rounded-2xl text-base transition-colors
                             shadow-xl shadow-red-200 dark:shadow-red-900/30
                             flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white
                                       rounded-full animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'whatsapp'
                        ? <MessageCircle size={18} />
                        : <CheckCircle size={18} />}
                      Place Order · ₹{total}
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: order summary sidebar ─────────────────────────────── */}
        <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-20">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Order Summary</h3>

            {/* Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="text-lg shrink-0">{item.image ?? item.emoji}</span>
                  <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">
                    {item.name} <span className="text-gray-400">×{item.qty}</span>
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white shrink-0">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span><span>₹{sub}</span>
              </div>
              <div className={`flex justify-between ${
                fee === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                <span>Delivery</span>
                <span>{fee === 0 ? 'FREE' : `₹${fee}`}</span>
              </div>
              {disc > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag size={11} /> {coupon?.code}
                  </span>
                  <span>− ₹{disc}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-gray-900 dark:text-white
                              text-base pt-2 border-t border-gray-100 dark:border-gray-700">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            {disc > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
                🎉 You're saving ₹{disc} on this order!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard = ({ title, icon: Icon, optional, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm"
  >
    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <Icon size={16} className="text-red-500" />
      {title}
      {optional && (
        <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">
          (optional)
        </span>
      )}
    </h3>
    <div className="space-y-3">{children}</div>
  </motion.div>
)

const Field = ({ label, name, type, placeholder, icon: Icon, value, onChange, error, hint, autoComplete }) => (
  <div>
    <label htmlFor={name} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
      {label} *
    </label>
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full pl-10 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-700/50
                    border rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-red-400/50
                    focus:border-red-400 transition-all ${
                      error
                        ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle size={11} /> {error}
      </p>
    )}
    {hint && !error && (
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{hint}</p>
    )}
  </div>
)

export default Checkout

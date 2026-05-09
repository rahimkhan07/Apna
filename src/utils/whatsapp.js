/**
 * whatsapp.js
 *
 * Utilities for generating WhatsApp order messages and opening wa.me links.
 */

/**
 * Build a formatted WhatsApp message from an order object.
 *
 * @param {object} order  — full order object (same shape as stored in localStorage)
 * @returns {string}      — plain-text message ready for URL encoding
 */
export const buildWhatsAppMessage = (order) => {
  const date = new Date(order.placedAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // Item lines  e.g.  "  • Classic Smash Burger x2  —  ₹498"
  const itemLines = order.items
    .map((i) => `  • ${i.name} x${i.qty}  —  ₹${i.price * i.qty}`)
    .join('\n')

  // Build coupon line only when a discount was applied
  const discountLine = order.discount > 0
    ? `\n🏷️ Discount (${order.couponCode ?? 'coupon'}): -₹${order.discount}`
    : ''

  const deliveryLine = order.deliveryFee === 0
    ? '🚚 Delivery: FREE'
    : `🚚 Delivery: ₹${order.deliveryFee}`

  const message = [
    `🍽️ *New Order — FoodieHub*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order ID:* ${order.id}`,
    `🕐 *Time:* ${date}`,
    ``,
    `👤 *Customer Details*`,
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${order.customer.address}`,
    order.customer.notes ? `Notes: ${order.customer.notes}` : null,
    ``,
    `🛒 *Order from ${order.shopName}*`,
    itemLines,
    ``,
    `💰 *Bill Summary*`,
    `Subtotal: ₹${order.subtotal}`,
    discountLine || null,
    deliveryLine,
    `*Total: ₹${order.total}*`,
    ``,
    `💳 Payment: ${order.paymentMethod}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Please confirm this order. Thank you! 🙏`,
  ]
    .filter((line) => line !== null)   // remove null lines (optional fields)
    .join('\n')

  return message
}

/**
 * Open WhatsApp with a pre-filled message.
 *
 * @param {string} phoneNumber  — international format without '+', e.g. "919876543210"
 * @param {string} message      — plain text (will be URI-encoded)
 */
export const openWhatsApp = (phoneNumber, message) => {
  const encoded = encodeURIComponent(message)
  const url = `https://wa.me/${phoneNumber}?text=${encoded}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Convenience: build message + open WhatsApp in one call.
 *
 * @param {string} phoneNumber
 * @param {object} order
 */
export const sendOrderViaWhatsApp = (phoneNumber, order) => {
  const message = buildWhatsAppMessage(order)
  openWhatsApp(phoneNumber, message)
}

const crypto = require('crypto')

/**
 * Verify Razorpay payment signature
 * Validates payment signature using HMAC SHA256 algorithm
 */
function verifySignature(orderId, paymentId, signature, secret){
  if (!orderId || !paymentId || !signature || !secret) return false
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(`${orderId}|${paymentId}`)
  const generated = hmac.digest('hex')
  return generated === signature
}

module.exports = { verifySignature }

const crypto = require('crypto')

function verifySignature(orderId, paymentId, signature, secret){
  if (!orderId || !paymentId || !signature || !secret) return false
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(`${orderId}|${paymentId}`)
  const generated = hmac.digest('hex')
  return generated === signature
}

module.exports = { verifySignature }

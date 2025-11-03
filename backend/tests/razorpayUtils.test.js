const { verifySignature } = require('../utils/razorpayUtils')
const crypto = require('crypto')

describe('razorpayUtils.verifySignature', () => {
  test('returns true for valid signature', () => {
    const secret = 'test_secret_123'
    const orderId = 'order_test_1'
    const paymentId = 'pay_test_1'
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(`${orderId}|${paymentId}`)
    const sig = hmac.digest('hex')
    expect(verifySignature(orderId, paymentId, sig, secret)).toBe(true)
  })

  test('returns false for invalid signature', () => {
    const secret = 'test_secret_123'
    const orderId = 'order_test_1'
    const paymentId = 'pay_test_1'
    const badSig = 'deadbeef'
    expect(verifySignature(orderId, paymentId, badSig, secret)).toBe(false)
  })

  test('returns false when missing inputs', () => {
    expect(verifySignature(null, 'a', 'b', 'c')).toBe(false)
    expect(verifySignature('a', null, 'b', 'c')).toBe(false)
    expect(verifySignature('a', 'b', null, 'c')).toBe(false)
    expect(verifySignature('a', 'b', 'c', null)).toBe(false)
  })
})

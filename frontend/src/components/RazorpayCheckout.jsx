import React, { useEffect, useState } from 'react'
import axios from 'axios'

function loadScript(src){
  return new Promise((resolve, reject)=>{
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load script ' + src))
    document.body.appendChild(s)
  })
}

export default function RazorpayCheckout({ order, keyId, onSuccess, onError, prefill }){
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Auto-open checkout when component mounts
    if (order && keyId) {
      openCheckout()
    }
  }, [order, keyId])

  const openCheckout = async () => {
    if (!order || !keyId) return onError && onError(new Error('Missing order or keyId'))
    setLoading(true)
    try{
      await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      const options = {
        key: keyId,
        amount: order.amount, // in paise
        currency: order.currency || 'INR',
        name: 'RouteMate',
        description: order.description || 'Ride payment',
        order_id: order.id,
        handler: function (response){
          // response: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
          onSuccess && onSuccess(response)
        },
        prefill: prefill || {},
        theme: { color: '#1f2937' },
        modal: {
          ondismiss: function() {
            onError && onError(new Error('Payment cancelled'))
          }
        }
      }
      const rz = new window.Razorpay(options)
      rz.open()
    }catch(err){
      console.error('Checkout failed', err)
      onError && onError(err)
    }finally{ setLoading(false) }
  }

  return (
    <button 
      onClick={openCheckout} 
      disabled={loading} 
      className="btn btn-primary"
      style={{
        width: '100%',
        padding: '14px 24px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '10px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? '⏳ Opening Razorpay...' : '💳 Pay with Razorpay'}
    </button>
  )
}

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
        theme: { color: '#1f2937' }
      }
      const rz = new window.Razorpay(options)
      rz.open()
    }catch(err){
      console.error('Checkout failed', err)
      onError && onError(err)
    }finally{ setLoading(false) }
  }

  return (
    <button onClick={openCheckout} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
      {loading ? 'Opening...' : 'Pay now'}
    </button>
  )
}

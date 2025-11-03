jest.mock('../models/Ride')
jest.mock('../models/User')
jest.mock('../models/Notification')
jest.mock('../utils/sendEmail')
jest.mock('razorpay')

const Razorpay = require('razorpay')
const Ride = require('../models/Ride')
const User = require('../models/User')
const Notification = require('../models/Notification')
const sendEmail = require('../utils/sendEmail')

const controller = require('../controllers/rideController')

describe('rideController.confirmBooking (paid ride)', () => {
  beforeEach(()=>{
    jest.resetAllMocks()
    process.env.RAZORPAY_KEY_ID = 'rz_key'
    process.env.RAZORPAY_KEY_SECRET = 'rz_secret'
  })

  test('creates razorpay order, saves orderId on booking, returns order and keyId, and creates notification', async () => {
    // prepare mocks
    const booking = { _id: 'b1', user: 'seeker1', status: 'pending', payment: {} }
    const ride = {
      _id: 'ride1',
      provider: 'prov1',
      bookings: [ booking ],
      price: '150',
      passengers: [],
      seatsAvailable: 3,
      save: jest.fn().mockResolvedValue(true)
    }
    ride.bookings.id = (id) => ride.bookings.find(b=>b._id===id)

    Ride.findById = jest.fn().mockResolvedValue(ride)

    // mock Razorpay orders.create
    const fakeOrder = { id: 'order_xyz', amount: 15000 }
    Razorpay.mockImplementation(()=>({ orders: { create: jest.fn().mockResolvedValue(fakeOrder) } }))

    // mock Notification model constructor to return object with save
    Notification.mockImplementation(function (data){ this.save = jest.fn().mockResolvedValue(true); this.data = data })

    // mock User.findById to return seeker with email
    User.findById = jest.fn().mockResolvedValue({ _id: 'seeker1', email: 's@example.com' })

    sendEmail.mockResolvedValue(true)

    const req = { params: { rideId: 'ride1', bookingId: 'b1' }, user: { id: 'prov1' } }
    const res = { json: jest.fn(), status: jest.fn(()=>res) }

    await controller.confirmBooking(req, res)

    // assertions
    expect(Ride.findById).toHaveBeenCalledWith('ride1')
    expect(ride.save).toHaveBeenCalled()
    expect(ride.bookings[0].payment.orderId).toBe(fakeOrder.id)
    expect(res.json).toHaveBeenCalled()
    const resp = res.json.mock.calls[0][0]
    expect(resp.order).toBeDefined()
    expect(resp.keyId).toBe(process.env.RAZORPAY_KEY_ID)
    // Notification should have been constructed with seeker id
    expect(Notification).toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalled()
  })
})

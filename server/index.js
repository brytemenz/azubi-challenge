require('dotenv').config()

const express = require('express')
const app = express()

const cors = require('cors')
app.use(express.json())
app.use(
  cors({
    origin: [
      'http://127.0.0.1:5173',
      'https://azubi-tmp.netlify.app/',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
)

const calculateTotal = function (items) {
  const prices = items.map(item => ({
    price: item.price.replace(/[^0-9]/g, ''),
    count: item.count,
  }))
  const total = prices.reduce((acc, item) => {
    return +item.price * item.count + acc
  }, 0)
  return total
}

const storeItems = new Map([
  ['XX99 MK II', { priceInCents: 299900, name: 'XX99 Mark II Headphones' }],
  ['XX99 MK I', { priceInCents: 175000, name: 'XX99 Mark I Headphones' }],
  ['XX59', { priceInCents: 89900, name: 'XX59 Headphones' }],
  ['ZX9', { priceInCents: 450000, name: 'ZX9 SPEAKER' }],
  ['ZX7', { priceInCents: 350000, name: 'ZX7 SPEAKER' }],
  ['YX1', { priceInCents: 59900, name: 'YX1 SPEAKER' }],
])

app.post('/create-checkout', async (req, res) => {
  const { items, userName, paymentMethod } = req.body

  if (!items || !paymentMethod || !userName) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const orderSummary = items.map(item => {
      const storeItem = storeItems.get(item.id)
      return {
        name: storeItem.name,
        quantity: item.quantity,
        price: storeItem.priceInCents,
      }
    })

    const total = calculateTotal(
      orderSummary.map(item => ({
        price: item.price.toString(),
        count: item.quantity,
      }))
    )

    console.log(`Order from ${userName} using ${paymentMethod}`)
    console.log('Order details:', orderSummary)
    console.log('Total amount:', total)

    const successUrl = `${process.env.SERVER_URL}/checkout?ordersuccess=true`
    res.json({ url: successUrl })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3000, () => {
  console.log('✅ Mock checkout server running on port 3000')
})

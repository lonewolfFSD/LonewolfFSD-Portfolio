// server.js (Node.js with Express)
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const app = express();

app.use(express.json());

const razorpay = new Razorpay({
  key_id: 'rzp_live_y2c1NPOWRBIcgH',
  key_secret: import.meta.env.RAZORPAY_SECRET, // Store in environment variable
});

// Create Razorpay order
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });
    res.json({ order_id: order.id });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
app.post('/verify-payment', (req, res) => {
  try {
    const { payment_id, order_id, signature } = req.body;
    const generatedSignature = crypto
      .createHmac('sha256', import.meta.env.RAZORPAY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    if (generatedSignature === signature) {
      res.json({ status: 'success' });
    } else {
      res.status(400).json({ status: 'failure', error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Notify support (optional)
app.post('/notify-support', async (req, res) => {
  const { userId, error, paymentId, credits } = req.body;
  // Implement notification logic (e.g., send email or log to monitoring)
  console.log(`Support notification: User ${userId}, Error: ${error}, Payment: ${paymentId}, Credits: ${credits}`);
  res.json({ status: 'notified' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
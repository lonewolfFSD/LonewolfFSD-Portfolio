import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const planMap = {
  Monthly: 'plan_QqGd7889Spn3R3',
  Quarterly: 'plan_quarterly_id',
  Yearly: 'plan_yearly_id',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { plan } = req.body;

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planMap[plan],
      total_count: 12, // Optional
      customer_notify: 1
    });

    res.status(200).json({
      subscription_id: subscription.id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Subscription Error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}

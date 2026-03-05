const crypto = require('crypto');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || secretKey.includes('YOUR_PAYSTACK')) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    // Get the hash from the request headers
    const hash = req.headers['x-paystack-signature'];
    if (!hash) {
      return res.status(400).json({ error: 'Missing Paystack signature' });
    }

    // Create hash from request body
    const body = JSON.stringify(req.body);
    const computedHash = crypto
      .createHmac('sha512', secretKey)
      .update(body)
      .digest('hex');

    // Verify the hash
    if (hash !== computedHash) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        // Payment was successful
        console.log('Payment successful:', event.data.reference);
        
        // Here you can:
        // - Update database
        // - Send confirmation email
        // - Trigger document generation
        // - Log the transaction
        
        // Return success to Paystack
        res.status(200).json({ received: true });
        break;

      case 'charge.failed':
        // Payment failed
        console.log('Payment failed:', event.data.reference);
        res.status(200).json({ received: true });
        break;

      case 'transfer.success':
        // Transfer successful (if you do payouts)
        console.log('Transfer successful:', event.data.reference);
        res.status(200).json({ received: true });
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
        res.status(200).json({ received: true });
    }

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed', 
      message: error.message 
    });
  }
};


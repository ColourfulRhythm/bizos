const axios = require('axios');

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
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || secretKey.includes('YOUR_PAYSTACK')) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`
        }
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      res.json({ 
        success: true, 
        verified: true,
        data: response.data.data 
      });
    } else {
      res.json({ 
        success: false, 
        verified: false,
        message: 'Payment not verified' 
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Verification failed', 
      message: error.response?.data?.message || error.message 
    });
  }
};


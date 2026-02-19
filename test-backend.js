// Quick test script to verify backend is working
const axios = require('axios');

async function testBackend() {
  const backendUrl = 'https://bizos.adparlay.com';
  
  console.log('Testing backend at:', backendUrl);
  
  // Test health endpoint
  try {
    const health = await axios.get(`${backendUrl}/health`);
    console.log('✅ Health check:', health.data);
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    return;
  }
  
  // Test generate endpoint (minimal data)
  try {
    const generate = await axios.post(`${backendUrl}/api/generate`, {
      businessData: {
        name: 'Test Business',
        industry: 'Technology',
        description: 'Test description',
        city: 'Lagos',
        country: 'Nigeria',
        salesChannel: 'Online',
        delivery: 'Digital',
        paymentModel: 'Upfront',
        bizSize: 'Small',
        customer: 'Tech professionals',
        existingDocs: '',
        products: '',
        brandTone: 'Professional'
      },
      uploadedFileContent: null
    });
    console.log('✅ Generate endpoint works:', generate.data.success);
  } catch (err) {
    console.error('❌ Generate endpoint failed:', err.response?.data || err.message);
  }
}

testBackend();


module.exports = (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BizOS Backend is running on Vercel',
    timestamp: new Date().toISOString()
  });
};


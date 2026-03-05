module.exports = (req, res) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="10" y="10" width="40" height="40" rx="5" fill="#0A0A0A"/>
    <rect x="50" y="10" width="40" height="40" rx="5" fill="#0A0A0A" opacity="0.6"/>
    <rect x="10" y="50" width="40" height="40" rx="5" fill="#0A0A0A" opacity="0.6"/>
    <rect x="50" y="50" width="40" height="40" rx="5" fill="#C8963E"/>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(svg);
};


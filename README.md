# BizOS - Business Operating System Generator

AI-powered platform that generates complete business operating systems (SOPs, templates, sales scripts, onboarding flows) for any business.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Anthropic API key
- Paystack account (for payments)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys:
   - `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/
   - `PAYSTACK_SECRET_KEY` - Get from https://dashboard.paystack.com/#/settings/developer
   - `PAYSTACK_PUBLIC_KEY` - Get from Paystack dashboard

3. **Start the backend server:**
   ```bash
   npm start
   ```
   Backend runs on http://localhost:3001

4. **Start the frontend server (in another terminal):**
   ```bash
   npm run frontend
   ```
   Frontend runs on http://localhost:3002

## 📁 Project Structure

```
bizos/
├── server.js           # Backend Express server
├── BizOS_MVP.html     # Frontend application
├── index.html          # Frontend entry point
├── package.json        # Dependencies
├── .env               # Environment variables (not in git)
├── .env.example       # Example environment file
└── README.md          # This file
```

## 🔧 Configuration

### Backend Configuration (.env)
- `PORT` - Backend server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3002)
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `CLAUDE_MODEL` - Claude model to use (default: claude-sonnet-4-20250514)
- `PAYSTACK_SECRET_KEY` - Paystack secret key
- `PAYSTACK_PUBLIC_KEY` - Paystack public key

### Frontend Configuration (BizOS_MVP.html)
Update the `CONFIG` object:
- `BACKEND_URL` - Backend API URL (default: http://localhost:3001)
- `PAYSTACK_PUBLIC_KEY` - Paystack public key (for frontend)

## 🎯 API Endpoints

### POST `/api/generate`
Generates business documents using Claude AI.

**Request:**
```json
{
  "businessData": {
    "name": "Business Name",
    "industry": "Industry",
    "description": "Business description",
    ...
  },
  "uploadedFileContent": "Optional file content"
}
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "folders": [...]
  }
}
```

### POST `/api/verify-payment`
Verifies Paystack payment.

**Request:**
```json
{
  "reference": "payment_reference"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "data": {...}
}
```

## 🧪 Testing

### Test Paystack Payments
Use Paystack test cards:
- **Success:** `4084084084084081`
- **Decline:** `5060666666666666666`
- CVV: Any 3 digits
- Expiry: Any future date

### Test Backend
```bash
curl http://localhost:3001/health
```

## 🚢 Production Deployment

1. **Update environment variables** for production
2. **Change `BACKEND_URL`** in frontend to production backend URL
3. **Use Paystack live keys** instead of test keys
4. **Set up proper CORS** in backend for your domain
5. **Use environment variables** for all sensitive keys

## 📝 Notes

- API keys are stored server-side for security
- Backend handles all Anthropic API calls
- Frontend only communicates with backend
- Payment verification is optional but recommended

## 📄 License

MIT


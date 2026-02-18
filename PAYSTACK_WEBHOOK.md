# Paystack Webhook Setup

## Webhook URL for Your Deployment

**Production Webhook URL:**
```
https://bizos.adparlay.com/api/webhook
```

**Or for Vercel preview deployments:**
```
https://bizos-pepjn0p2k-colourfulrhythms-projects.vercel.app/api/webhook
```

## How to Set Up in Paystack Dashboard

1. **Login to Paystack Dashboard:**
   - Go to https://dashboard.paystack.com/
   - Navigate to **Settings** → **Webhooks**

2. **Add Webhook URL:**
   - Click **"Add Webhook URL"**
   - Enter: `https://bizos.adparlay.com/api/webhook`
   - Select events to listen for:
     - ✅ `charge.success` - Payment successful
     - ✅ `charge.failed` - Payment failed
     - ✅ `transfer.success` - Transfer successful (optional)

3. **Save and Test:**
   - Click **"Save"**
   - Paystack will send a test webhook to verify the URL works
   - Check your Vercel logs to confirm it's received

## What the Webhook Does

The webhook endpoint (`/api/webhook`) will:
- ✅ Verify the webhook signature (security)
- ✅ Handle `charge.success` events (payment completed)
- ✅ Handle `charge.failed` events (payment failed)
- ✅ Log all events for debugging

## Events You Can Handle

### charge.success
Triggered when a payment is successful. You can:
- Update your database
- Send confirmation emails
- Trigger document generation
- Log the transaction

### charge.failed
Triggered when a payment fails. You can:
- Notify the user
- Log the failure reason
- Update order status

## Testing Webhooks

### Test with Paystack Test Mode:
1. Use test cards in your app
2. Complete a test payment
3. Check Vercel logs for webhook events

### Manual Test:
You can test the webhook endpoint manually:
```bash
curl -X POST https://bizos.adparlay.com/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test-signature" \
  -d '{"event":"charge.success","data":{"reference":"test_ref"}}'
```

## Security

The webhook verifies Paystack signatures using HMAC SHA512 to ensure:
- ✅ Requests are from Paystack
- ✅ Data hasn't been tampered with
- ✅ Only legitimate events are processed

## Monitoring

Check webhook activity:
- **Vercel Logs:** Go to your deployment → Runtime Logs
- **Paystack Dashboard:** Settings → Webhooks → View delivery logs

## Troubleshooting

### Webhook not receiving events?
1. Check webhook URL is correct in Paystack dashboard
2. Verify environment variable `PAYSTACK_SECRET_KEY` is set in Vercel
3. Check Vercel function logs for errors
4. Ensure webhook URL is publicly accessible (not localhost)

### Signature verification failing?
- Make sure `PAYSTACK_SECRET_KEY` matches your Paystack account
- Check that the secret key is set for Production environment in Vercel

## Next Steps

After setting up the webhook:
1. ✅ Test with a real payment (use test mode first)
2. ✅ Monitor Vercel logs for webhook events
3. ✅ Add database logging if needed
4. ✅ Set up email notifications for successful payments


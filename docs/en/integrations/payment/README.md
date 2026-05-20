# Payment Integration

Payment covers products, orders, subscriptions, credits, payment webhooks, and entitlement delivery.

Supported providers:

- Stripe for card payments and subscriptions.
- NowPayments for optional crypto payments.

## Rules

- Get Stripe through `getStripe()` from `@/server/order/services/stripe/client`.
- Do not call payment SDKs directly from frontend code.
- Do not hard-code prices; query product data.
- Payment status changes are webhook-driven.
- Frontend confirmation is only compensating polling.
- Entitlement delivery goes through fulfillment and billing services.
- Do not grant credits directly in webhook handlers.

## Configuration

Common environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_WEBHOOK_SECRET`

Update `src/env.js`, `.env.example`, and provider registration when adding payment configuration.

## Webhooks And Idempotency

- Verify webhook signatures before processing.
- Store or check provider event IDs where applicable.
- Make entitlement delivery idempotent.
- Worker compensation should retry safely and never double-grant credits.

## Testing

For payment changes, test:

- Checkout creation.
- Webhook signature rejection.
- Successful entitlement delivery.
- Duplicate webhook behavior.
- Refund, renewal, or subscription state transitions when touched.

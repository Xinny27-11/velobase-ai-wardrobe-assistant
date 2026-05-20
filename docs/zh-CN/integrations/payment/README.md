# 支付集成

支付覆盖 products、orders、subscriptions、credits、payment webhooks 和 entitlement delivery。

支持的 providers：

- Stripe：银行卡支付和订阅。
- NowPayments：可选加密货币支付。

## 规则

- 通过 `@/server/order/services/stripe/client` 的 `getStripe()` 获取 Stripe。
- 前端代码不要直接调用 payment SDK。
- 不要硬编码价格；查询 product data。
- 支付状态变化以 webhook 为准。
- 前端确认只作为补偿轮询。
- 权益发放走 fulfillment 和 billing services。
- 不要在 webhook handlers 中直接发放 credits。

## 配置

常见环境变量：

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_WEBHOOK_SECRET`

新增支付配置时，同步更新 `src/env.js`、`.env.example` 和 provider registration。

## Webhooks 与幂等

- 处理前验证 webhook signatures。
- 适用时存储或检查 provider event IDs。
- 权益发放必须幂等。
- Worker compensation 要可安全重试，不能重复发放 credits。

## 测试

支付变更需测试：

- Checkout creation。
- Webhook signature rejection。
- Successful entitlement delivery。
- Duplicate webhook behavior。
- 涉及 refund、renewal 或 subscription state transitions 时覆盖对应场景。

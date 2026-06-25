import { BRAND } from "@/components/ui/brand-tokens";

export interface EmailTemplate {
  subject: string;
  preheader: string;
  html: string;
}

function emailHeader(subBrand?: string): string {
  const brand = subBrand
    ? BRAND.subBrands[subBrand as keyof typeof BRAND.subBrands]
    : null;
  const headerName = brand?.name || BRAND.name;
  const accentColor = brand?.accent || BRAND.colors.orange;

  return `
    <div style="background:#0A1628;padding:24px 32px;text-align:center;">
      <h1 style="color:#FFFFFF;font-family:Inter,system-ui,sans-serif;font-size:24px;font-weight:900;letter-spacing:3px;margin:0;">
        ${headerName.split(" ").map((w: string, i: number) =>
          i === headerName.split(" ").length - 1 && brand
            ? `<span style="color:${accentColor}">${w}</span>`
            : w
        ).join(" ")}
      </h1>
    </div>
  `;
}

function emailFooter(): string {
  return `
    <div style="background:#0A1628;padding:32px;text-align:center;">
      <p style="color:#94A3B8;font-family:Inter,system-ui,sans-serif;font-size:12px;margin:0 0 8px 0;">
        KAUVEX Global Ltd | support@kauvex.com
      </p>
      <p style="color:#FFFFFF;font-family:Inter,system-ui,sans-serif;font-size:14px;font-style:italic;margin:0 0 16px 0;">
        ${BRAND.tagline}
      </p>
      <div style="margin:16px 0;">
        <a href="#" style="color:#94A3B8;font-family:Inter,system-ui,sans-serif;font-size:12px;text-decoration:none;margin:0 8px;">Instagram</a>
        <a href="#" style="color:#94A3B8;font-family:Inter,system-ui,sans-serif;font-size:12px;text-decoration:none;margin:0 8px;">Twitter/X</a>
        <a href="#" style="color:#94A3B8;font-family:Inter,system-ui,sans-serif;font-size:12px;text-decoration:none;margin:0 8px;">Facebook</a>
        <a href="#" style="color:#94A3B8;font-family:Inter,system-ui,sans-serif;font-size:12px;text-decoration:none;margin:0 8px;">TikTok</a>
        <a href="#" style="color:#94A3B8;font-family:Inter,system-ui,sans-serif;font-size:12px;text-decoration:none;margin:0 8px;">YouTube</a>
      </div>
      <p style="color:#64748B;font-family:Inter,system-ui,sans-serif;font-size:11px;margin:16px 0 0 0;">
        <a href="#" style="color:#64748B;text-decoration:underline;">Unsubscribe</a> |
        <a href="#" style="color:#64748B;text-decoration:underline;">Privacy Policy</a> |
        <a href="#" style="color:#64748B;text-decoration:underline;">Contact Us</a>
      </p>
    </div>
  `;
}

function emailBody(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#F5F7FA;font-family:Inter,system-ui,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FA;">
        <tr><td align="center" style="padding:32px 16px;">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            ${emailHeader()}
            <tr><td style="padding:32px;">
              ${content}
            </td></tr>
            ${emailFooter()}
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

export const emailTemplates = {
  orderConfirmed: (data: {
    customerName: string;
    orderId: string;
    items: { name: string; qty: number; price: string }[];
    total: string;
    estimatedDelivery: string;
  }): EmailTemplate => ({
    subject: `Order ${data.orderId} confirmed!`,
    preheader: `Your order is confirmed and being prepared.`,
    html: emailBody(`
      <div style="background:#16A34A;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#FFFFFF;font-size:20px;font-weight:700;margin:0;">Order Confirmed ✓</h2>
      </div>
      <h2 style="color:#0A1628;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hi ${data.customerName},</h2>
      <p style="color:#1E293B;font-size:16px;margin:0 0 24px 0;">Your order is confirmed and being prepared.</p>
      <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom:24px;">
        <tr style="background:#F5F7FA;">
          <td style="font-weight:600;color:#1E293B;font-size:13px;">Item</td>
          <td style="font-weight:600;color:#1E293B;font-size:13px;text-align:center;">Qty</td>
          <td style="font-weight:600;color:#1E293B;font-size:13px;text-align:right;">Price</td>
        </tr>
        ${data.items.map(item => `
          <tr>
            <td style="color:#1E293B;font-size:14px;border-bottom:1px solid #E2E8F0;">${item.name}</td>
            <td style="color:#1E293B;font-size:14px;text-align:center;border-bottom:1px solid #E2E8F0;">${item.qty}</td>
            <td style="color:#1E293B;font-size:14px;text-align:right;border-bottom:1px solid #E2E8F0;">${item.price}</td>
          </tr>
        `).join("")}
        <tr>
          <td colspan="2" style="font-weight:700;color:#1E293B;font-size:16px;padding-top:12px;">Total</td>
          <td style="font-weight:700;color:#FF6B00;font-size:16px;text-align:right;padding-top:12px;">${data.total}</td>
        </tr>
      </table>
      <p style="color:#64748B;font-size:14px;margin:0 0 8px 0;">Estimated delivery:</p>
      <p style="color:#0A1628;font-size:16px;font-weight:600;margin:0 0 24px 0;">${data.estimatedDelivery}</p>
      <a href="https://kauvex.com/orders/${data.orderId}/tracking" style="display:inline-block;background:#FF6B00;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">Track Order</a>
    `),
  }),

  orderShipped: (data: {
    customerName: string;
    orderId: string;
    trackingNumber: string;
    carrier: string;
  }): EmailTemplate => ({
    subject: `Your order is on the way!`,
    preheader: `Track your shipment in real-time.`,
    html: emailBody(`
      <div style="background:#2563EB;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#FFFFFF;font-size:20px;font-weight:700;margin:0;">Your order is on the way 🚀</h2>
      </div>
      <h2 style="color:#0A1628;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hi ${data.customerName},</h2>
      <p style="color:#1E293B;font-size:16px;margin:0 0 24px 0;">Your order has been shipped via ${data.carrier}.</p>
      <div style="background:#F5F7FA;padding:16px;border-radius:8px;margin-bottom:24px;">
        <p style="color:#64748B;font-size:12px;margin:0 0 4px 0;">Tracking Number</p>
        <p style="color:#0A1628;font-size:16px;font-weight:600;font-family:'JetBrains Mono',monospace;margin:0;">${data.trackingNumber}</p>
      </div>
      <a href="https://kauvex.com/orders/${data.orderId}/tracking" style="display:inline-block;background:#FF6B00;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">Track Now</a>
    `),
  }),

  orderDelivered: (data: {
    customerName: string;
    orderId: string;
    loyaltyPoints?: number;
  }): EmailTemplate => ({
    subject: `Delivered! Hope you love it`,
    preheader: `Your order has arrived.`,
    html: emailBody(`
      <div style="background:#16A34A;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#FFFFFF;font-size:20px;font-weight:700;margin:0;">Delivered! Hope you love it ✅</h2>
      </div>
      <h2 style="color:#0A1628;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hi ${data.customerName},</h2>
      <p style="color:#1E293B;font-size:16px;margin:0 0 24px 0;">Your order has been delivered successfully.</p>
      ${data.loyaltyPoints ? `
        <div style="background:#FFFBEB;padding:16px;border-radius:8px;margin-bottom:24px;border:1px solid #FDE68A;">
          <p style="color:#D97706;font-size:14px;font-weight:600;margin:0;">🎉 You earned ${data.loyaltyPoints} loyalty points!</p>
        </div>
      ` : ""}
      <a href="https://kauvex.com/orders/${data.orderId}/review" style="display:inline-block;background:#FF6B00;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;margin-right:12px;">Rate Your Purchase</a>
      <a href="https://kauvex.com/shop" style="display:inline-block;background:#0A1628;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">Shop Again</a>
    `),
  }),

  paymentFailed: (data: {
    customerName: string;
    orderId: string;
    reason: string;
  }): EmailTemplate => ({
    subject: `Payment issue with your order`,
    preheader: `There was a problem with your payment.`,
    html: emailBody(`
      <div style="background:#DC2626;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#FFFFFF;font-size:20px;font-weight:700;margin:0;">Payment Failed</h2>
      </div>
      <h2 style="color:#0A1628;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hi ${data.customerName},</h2>
      <p style="color:#1E293B;font-size:16px;margin:0 0 16px 0;">There was a problem with your payment.</p>
      <p style="color:#64748B;font-size:14px;margin:0 0 24px 0;">${data.reason}</p>
      <a href="https://kauvex.com/checkout/${data.orderId}/retry" style="display:inline-block;background:#FF6B00;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">Retry Payment</a>
      <p style="color:#64748B;font-size:13px;margin:24px 0 0 0;">Need help? <a href="https://kauvex.com/help" style="color:#FF6B00;text-decoration:none;">Contact support</a></p>
    `),
  }),

  disputeRaised: (data: {
    customerName: string;
    disputeId: string;
    orderId: string;
  }): EmailTemplate => ({
    subject: `Dispute ${data.disputeId} received`,
    preheader: `Your dispute has been received and is being reviewed.`,
    html: emailBody(`
      <div style="background:#D97706;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#FFFFFF;font-size:20px;font-weight:700;margin:0;">Dispute Received</h2>
      </div>
      <h2 style="color:#0A1628;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hi ${data.customerName},</h2>
      <p style="color:#1E293B;font-size:16px;margin:0 0 16px 0;">Your dispute has been received and is being reviewed.</p>
      <div style="background:#F5F7FA;padding:16px;border-radius:8px;margin-bottom:24px;">
        <p style="color:#64748B;font-size:12px;margin:0 0 4px 0;">Dispute Reference</p>
        <p style="color:#0A1628;font-size:16px;font-weight:600;font-family:'JetBrains Mono',monospace;margin:0;">${data.disputeId}</p>
      </div>
      <p style="color:#1E293B;font-size:14px;margin:0 0 24px 0;">Our team will review your case and respond within 48 hours.</p>
      <a href="https://kauvex.com/orders/${data.orderId}/dispute" style="display:inline-block;background:#FF6B00;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">Track Dispute</a>
    `),
  }),

  vendorPayout: (data: {
    vendorName: string;
    amount: string;
    bankReference: string;
    method: string;
  }): EmailTemplate => ({
    subject: `Your payout of ${data.amount} has been sent`,
    preheader: `Payout processed to your ${data.method} account.`,
    html: emailBody(`
      <div style="background:#0A1628;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#FFFFFF;font-size:20px;font-weight:700;margin:0;">Payout Processed</h2>
      </div>
      <h2 style="color:#0A1628;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hi ${data.vendorName},</h2>
      <p style="color:#1E293B;font-size:16px;margin:0 0 24px 0;">Your payout has been sent to your ${data.method} account.</p>
      <div style="background:#ECFDF5;padding:16px;border-radius:8px;margin-bottom:24px;border:1px solid #A7F3D0;">
        <p style="color:#64748B;font-size:12px;margin:0 0 4px 0;">Amount Sent</p>
        <p style="color:#16A34A;font-size:28px;font-weight:700;margin:0 0 8px 0;">${data.amount}</p>
        <p style="color:#64748B;font-size:12px;margin:0 0 4px 0;">Reference</p>
        <p style="color:#0A1628;font-size:14px;font-family:'JetBrains Mono',monospace;margin:0;">${data.bankReference}</p>
      </div>
      <a href="https://kauvex.com/vendor/wallet" style="display:inline-block;background:#FF6B00;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">View Statement</a>
    `),
  }),

  affiliatePayment: (data: {
    partnerName: string;
    amount: string;
    period: string;
  }): EmailTemplate => ({
    subject: `Your commission of ${data.amount} is on its way`,
    preheader: `Commission payment processed.`,
    html: emailBody(`
      <div style="background:#7C3AED;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#FFFFFF;font-size:20px;font-weight:700;margin:0;">Commission Payment</h2>
      </div>
      <h2 style="color:#0A1628;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hi ${data.partnerName},</h2>
      <p style="color:#1E293B;font-size:16px;margin:0 0 24px 0;">Your commission payment for ${data.period} has been processed.</p>
      <div style="background:#F5F3FF;padding:16px;border-radius:8px;margin-bottom:24px;border:1px solid #DDD6FE;">
        <p style="color:#64748B;font-size:12px;margin:0 0 4px 0;">Commission Earned</p>
        <p style="color:#7C3AED;font-size:28px;font-weight:700;margin:0;">${data.amount}</p>
      </div>
      <a href="https://partners.kauvex.com/dashboard" style="display:inline-block;background:#FF6B00;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">View Dashboard</a>
    `),
  }),

  logisticsPartnerPayout: (data: {
    partnerName: string;
    amount: string;
    jobsCompleted: number;
  }): EmailTemplate => ({
    subject: `Your earnings of ${data.amount} have been sent`,
    preheader: `Payment processed to your account.`,
    html: emailBody(`
      <div style="background:#0A1628;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#FFFFFF;font-size:20px;font-weight:700;margin:0;">Earnings Processed</h2>
      </div>
      <h2 style="color:#0A1628;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hi ${data.partnerName},</h2>
      <p style="color:#1E293B;font-size:16px;margin:0 0 24px 0;">Your earnings have been sent to your account.</p>
      <div style="background:#EEF2F7;padding:16px;border-radius:8px;margin-bottom:24px;border:1px solid #E2E8F0;">
        <p style="color:#64748B;font-size:12px;margin:0 0 4px 0;">Total Earnings</p>
        <p style="color:#0A1628;font-size:28px;font-weight:700;margin:0 0 8px 0;">${data.amount}</p>
        <p style="color:#64748B;font-size:13px;margin:0;">${data.jobsCompleted} jobs completed</p>
      </div>
      <a href="https://logistics.kauvex.com/earnings" style="display:inline-block;background:#FF6B00;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">View Earnings</a>
    `),
  }),

  fbkLowBalance: (data: {
    vendorName: string;
    balance: string;
  }): EmailTemplate => ({
    subject: `Low wallet balance alert`,
    preheader: `Your FBK wallet balance is low.`,
    html: emailBody(`
      <div style="background:#D97706;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#FFFFFF;font-size:20px;font-weight:700;margin:0;">Low Wallet Balance ⚠️</h2>
      </div>
      <h2 style="color:#0A1628;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hi ${data.vendorName},</h2>
      <p style="color:#1E293B;font-size:16px;margin:0 0 24px 0;">Your FBK wallet balance is running low.</p>
      <div style="background:#FFFBEB;padding:16px;border-radius:8px;margin-bottom:24px;border:1px solid #FDE68A;">
        <p style="color:#64748B;font-size:12px;margin:0 0 4px 0;">Current Balance</p>
        <p style="color:#D97706;font-size:28px;font-weight:700;margin:0;">${data.balance}</p>
      </div>
      <p style="color:#1E293B;font-size:14px;margin:0 0 24px 0;">Top up your wallet to avoid product delisting.</p>
      <a href="https://kauvex.com/vendor/wallet/top-up" style="display:inline-block;background:#FF6B00;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">Top Up Wallet</a>
    `),
  }),
};

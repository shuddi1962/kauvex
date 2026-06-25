export interface SmsTemplate {
  message: string;
}

export const smsTemplates = {
  orderConfirmed: (data: {
    orderId: string;
    estimatedDelivery: string;
    trackingUrl: string;
  }): SmsTemplate => ({
    message: `Kauvex: Order #${data.orderId} confirmed! Est. delivery ${data.estimatedDelivery}. Track: ${data.trackingUrl}`,
  }),

  orderShipped: (data: {
    orderId: string;
    trackingUrl: string;
    deliveryPin?: string;
  }): SmsTemplate => ({
    message: `Kauvex: Your order is on the way! Track live: ${data.trackingUrl}${data.deliveryPin ? `. Delivery PIN: ${data.deliveryPin}` : ""}`,
  }),

  orderDelivered: (data: { orderId: string }): SmsTemplate => ({
    message: `Kauvex: Order #${data.orderId} delivered! We hope you love it. Leave a review: kauvex.com/r/${data.orderId}`,
  }),

  partnerPayout: (data: {
    amount: string;
    accountLast4: string;
    reference: string;
  }): SmsTemplate => ({
    message: `Kauvex Logistics: ${data.amount} sent to your account ending ${data.accountLast4}. Ref: ${data.reference}`,
  }),

  fbkLowBalance: (data: { balance: string }): SmsTemplate => ({
    message: `Kauvex FBK: Low wallet balance ${data.balance}. Top up at kauvex.com/vendor/wallet to avoid product delisting.`,
  }),

  deliveryPin: (data: { pin: string; riderName: string }): SmsTemplate => ({
    message: `Kauvex: Your rider ${data.riderName} is on the way. Delivery PIN: ${data.pin}. Show this to the rider on delivery.`,
  }),

  disputeUpdate: (data: {
    disputeId: string;
    status: string;
  }): SmsTemplate => ({
    message: `Kauvex: Dispute ${data.disputeId} status updated to "${data.status}". Track: kauvex.com/disputes/${data.disputeId}`,
  }),
};

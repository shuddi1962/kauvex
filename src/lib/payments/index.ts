import Stripe from "stripe";
import prisma from "@/lib/db";

export interface PaymentGateway {
  name: string;
  code: string;
}

export interface PaymentIntent {
  id: string;
  gatewayRef: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  approvalUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  gatewayRef: string;
  status: string;
  message?: string;
  paymentIntent?: PaymentIntent;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  gatewayRef: string;
  status: string;
  amount: number;
  message?: string;
}

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    reference: string;
    status: string;
    amount: number;
    currency: string;
    fees: number;
    paid_at: string;
    channel: string;
    metadata: Record<string, unknown>;
  };
}

interface PaystackRefundResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    transaction_reference: string;
    status: string;
    amount: number;
  };
}

interface FlutterwaveInitResponse {
  status: string;
  message: string;
  data?: {
    link: string;
    id: number;
    tx_ref: string;
  };
}

interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    status: string;
    amount: number;
    currency: string;
    fees: number;
    charged_amount: number;
    customer: { email: string };
  };
}

interface FlutterwaveRefundResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    transaction_id: number;
    status: string;
    amount_refunded: number;
  };
}

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: { rel: string; href: string; method: string }[];
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: {
    payments: {
      captures: { id: string; status: string; amount: { value: string; currency_code: string } }[];
    };
  }[];
}

interface PayPalRefundResponse {
  id: string;
  status: string;
  amount: { value: string; currency_code: string };
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal client ID or secret not configured");
  }
  const base = process.env.PAYPAL_SANDBOX === "true" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }
  const data: PayPalTokenResponse = await res.json();
  return data.access_token;
}

function paystackHeaders(): Record<string, string> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Paystack secret key not configured");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function flutterwaveHeaders(): Record<string, string> {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("Flutterwave secret key not configured");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export class StripeGateway implements PaymentGateway {
  name = "Stripe";
  code = "stripe";
  private client: Stripe;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Stripe secret key not configured");
    this.client = new Stripe(key, {
      apiVersion: "2026-05-27.dahlia",
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    const intent = await this.client.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });
    return {
      id: intent.id,
      gatewayRef: intent.id,
      amount,
      currency: currency.toUpperCase(),
      status: intent.status,
      clientSecret: intent.client_secret || undefined,
      metadata: intent.metadata as Record<string, unknown>,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    const intent = await this.client.paymentIntents.confirm(paymentIntentId);
    return {
      success: intent.status === "succeeded" || intent.status === "processing",
      gatewayRef: intent.id,
      status: intent.status,
      paymentIntent: {
        id: intent.id,
        gatewayRef: intent.id,
        amount: intent.amount / 100,
        currency: intent.currency.toUpperCase(),
        status: intent.status,
        clientSecret: intent.client_secret || undefined,
      },
    };
  }

  async processRefund(transactionId: string, amount?: number): Promise<RefundResult> {
    const refund = await this.client.refunds.create({
      payment_intent: transactionId,
      ...(amount !== undefined ? { amount: Math.round(amount * 100) } : {}),
    });
    return {
      success: refund.status === "succeeded",
      refundId: refund.id,
      gatewayRef: refund.payment_intent as string,
      status: refund.status ?? "unknown",
      amount: refund.amount / 100,
    };
  }

  async handleWebhook(payload: string, signature: string): Promise<{ event: string; data: Record<string, unknown> }> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("Stripe webhook secret not configured");
    const event = this.client.webhooks.constructEvent(payload, signature, secret);
    return {
      event: event.type,
      data: event.data.object as unknown as Record<string, unknown>,
    };
  }
}

export class PaystackGateway implements PaymentGateway {
  name = "Paystack";
  code = "paystack";
  private base = "https://api.paystack.co";

  async initializeTransaction(
    email: string,
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>
  ): Promise<PaymentIntent> {
    const res = await fetch(`${this.base}/transaction/initialize`, {
      method: "POST",
      headers: paystackHeaders(),
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        metadata: metadata || {},
      }),
    });
    const data: PaystackInitResponse = await res.json();
    if (!data.status || !data.data) {
      throw new Error(`Paystack init failed: ${data.message}`);
    }
    return {
      id: data.data.reference,
      gatewayRef: data.data.reference,
      amount,
      currency: currency.toUpperCase(),
      status: "pending",
      approvalUrl: data.data.authorization_url,
      metadata,
    };
  }

  async verifyTransaction(reference: string): Promise<PaymentResult> {
    const res = await fetch(`${this.base}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: paystackHeaders(),
    });
    const data: PaystackVerifyResponse = await res.json();
    if (!data.status) {
      return { success: false, gatewayRef: reference, status: "failed", message: data.message };
    }
    const tx = data.data!;
    return {
      success: tx.status === "success",
      transactionId: String(tx.id),
      gatewayRef: tx.reference,
      status: tx.status,
    };
  }

  async processRefund(transactionRef: string, amount?: number): Promise<RefundResult> {
    const res = await fetch(`${this.base}/refund`, {
      method: "POST",
      headers: paystackHeaders(),
      body: JSON.stringify({
        transaction: transactionRef,
        ...(amount !== undefined ? { amount: Math.round(amount * 100) } : {}),
      }),
    });
    const data: PaystackRefundResponse = await res.json();
    if (!data.status || !data.data) {
      throw new Error(`Paystack refund failed: ${data.message}`);
    }
    return {
      success: data.data.status === "success" || data.data.status === "pending",
      refundId: String(data.data.id),
      gatewayRef: data.data.transaction_reference,
      status: data.data.status,
      amount: data.data.amount / 100,
    };
  }

  async handleWebhook(payload: string, _signature: string): Promise<{ event: string; data: Record<string, unknown> }> {
    const parsed = JSON.parse(payload);
    return {
      event: parsed.event as string,
      data: parsed.data as Record<string, unknown>,
    };
  }
}

export class FlutterwaveGateway implements PaymentGateway {
  name = "Flutterwave";
  code = "flutterwave";
  private base = "https://api.flutterwave.com/v3";

  async initializePayment(
    email: string,
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>
  ): Promise<PaymentIntent> {
    const txRef = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const res = await fetch(`${this.base}/payments`, {
      method: "POST",
      headers: flutterwaveHeaders(),
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency: currency.toUpperCase(),
        redirect_url: metadata?.redirect_url || "",
        customer: { email },
        meta: metadata || {},
      }),
    });
    const data: FlutterwaveInitResponse = await res.json();
    if (data.status !== "success" || !data.data) {
      throw new Error(`Flutterwave init failed: ${data.message}`);
    }
    return {
      id: String(data.data.id),
      gatewayRef: data.data.tx_ref,
      amount,
      currency: currency.toUpperCase(),
      status: "pending",
      approvalUrl: data.data.link,
      metadata,
    };
  }

  async verifyTransaction(transactionId: string): Promise<PaymentResult> {
    const res = await fetch(`${this.base}/transactions/${encodeURIComponent(transactionId)}/verify`, {
      headers: flutterwaveHeaders(),
    });
    const data: FlutterwaveVerifyResponse = await res.json();
    if (data.status !== "success" || !data.data) {
      return { success: false, gatewayRef: transactionId, status: "failed", message: data.message };
    }
    const tx = data.data;
    return {
      success: tx.status === "successful",
      transactionId: String(tx.id),
      gatewayRef: tx.tx_ref,
      status: tx.status,
    };
  }

  async processRefund(transactionId: string, amount?: number): Promise<RefundResult> {
    const res = await fetch(`${this.base}/transactions/${encodeURIComponent(transactionId)}/refund`, {
      method: "POST",
      headers: flutterwaveHeaders(),
      body: amount !== undefined ? JSON.stringify({ amount }) : undefined,
    });
    const data: FlutterwaveRefundResponse = await res.json();
    if (data.status !== "success" || !data.data) {
      throw new Error(`Flutterwave refund failed: ${data.message}`);
    }
    return {
      success: data.data.status === "success" || data.data.status === "pending",
      refundId: String(data.data.id),
      gatewayRef: String(data.data.transaction_id),
      status: data.data.status,
      amount: data.data.amount_refunded,
    };
  }

  async handleWebhook(payload: string, _signature: string): Promise<{ event: string; data: Record<string, unknown> }> {
    const parsed = JSON.parse(payload);
    return {
      event: parsed.event ?? parsed["event.type"] ?? "unknown",
      data: parsed.data as Record<string, unknown>,
    };
  }
}

export class PayPalGateway implements PaymentGateway {
  name = "PayPal";
  code = "paypal";
  private base: string;

  constructor() {
    this.base = process.env.PAYPAL_SANDBOX === "true" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  }

  async createOrder(amount: number, currency: string): Promise<PaymentIntent> {
    const token = await getPayPalAccessToken();
    const res = await fetch(`${this.base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency.toUpperCase(),
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal create order failed: ${err}`);
    }
    const data: PayPalOrderResponse = await res.json();
    const approvalLink = data.links?.find((l) => l.rel === "approve")?.href;
    return {
      id: data.id,
      gatewayRef: data.id,
      amount,
      currency: currency.toUpperCase(),
      status: data.status,
      approvalUrl: approvalLink,
    };
  }

  async captureOrder(orderId: string): Promise<PaymentResult> {
    const token = await getPayPalAccessToken();
    const res = await fetch(`${this.base}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const err = await res.text();
      return { success: false, gatewayRef: orderId, status: "failed", message: err };
    }
    const data: PayPalCaptureResponse = await res.json();
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    return {
      success: data.status === "COMPLETED",
      transactionId: capture?.id,
      gatewayRef: data.id,
      status: data.status,
    };
  }

  async processRefund(captureId: string, amount?: number): Promise<RefundResult> {
    const token = await getPayPalAccessToken();
    const body: Record<string, unknown> = {};
    if (amount !== undefined) {
      body.amount = { value: amount.toFixed(2), currency_code: "USD" };
    }
    const res = await fetch(`${this.base}/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal refund failed: ${err}`);
    }
    const data: PayPalRefundResponse = await res.json();
    return {
      success: data.status === "COMPLETED",
      refundId: data.id,
      gatewayRef: captureId,
      status: data.status,
      amount: parseFloat(data.amount?.value || "0"),
    };
  }

  async handleWebhook(payload: string, _signature: string): Promise<{ event: string; data: Record<string, unknown> }> {
    const parsed = JSON.parse(payload);
    return {
      event: parsed.event_type as string,
      data: parsed.resource as Record<string, unknown>,
    };
  }
}

const gateways = new Map<string, PaymentGateway & Record<string, unknown>>();

export function getGateway(gatewayName: string): StripeGateway | PaystackGateway | FlutterwaveGateway | PayPalGateway {
  const name = gatewayName.toLowerCase();
  switch (name) {
    case "stripe":
      return new StripeGateway();
    case "paystack":
      return new PaystackGateway();
    case "flutterwave":
      return new FlutterwaveGateway();
    case "paypal":
      return new PayPalGateway();
    default:
      throw new Error(`Unknown payment gateway: "${gatewayName}". Available: stripe, paystack, flutterwave, paypal`);
  }
}

interface PaymentOrderInput {
  id: string;
  total: number;
  currency: string;
  customerEmail?: string;
  customerId?: string;
  vendorId?: string;
  metadata?: Record<string, unknown>;
  description?: string;
}

export async function processPayment(
  order: PaymentOrderInput,
  gatewayName: string,
  returnUrl?: string
): Promise<PaymentIntent> {
  const gateway = getGateway(gatewayName) as
    | StripeGateway
    | PaystackGateway
    | FlutterwaveGateway
    | PayPalGateway;

  let paymentIntent: PaymentIntent;

  if (gateway instanceof StripeGateway) {
    paymentIntent = await gateway.createPaymentIntent(order.total, order.currency, {
      orderId: order.id,
      ...(order.metadata as Record<string, string>),
    });
  } else if (gateway instanceof PaystackGateway) {
    if (!order.customerEmail) throw new Error("Customer email required for Paystack");
    paymentIntent = await gateway.initializeTransaction(
      order.customerEmail,
      order.total,
      order.currency,
      { ...order.metadata, orderId: order.id, redirect_url: returnUrl }
    );
  } else if (gateway instanceof FlutterwaveGateway) {
    if (!order.customerEmail) throw new Error("Customer email required for Flutterwave");
    paymentIntent = await gateway.initializePayment(
      order.customerEmail,
      order.total,
      order.currency,
      { ...order.metadata, orderId: order.id, redirect_url: returnUrl }
    );
  } else if (gateway instanceof PayPalGateway) {
    paymentIntent = await gateway.createOrder(order.total, order.currency);
  } else {
    throw new Error(`Unsupported gateway: ${gatewayName}`);
  }

  await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      vendorId: order.vendorId || null,
      customerId: order.customerId || null,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      gateway: gatewayName,
      gatewayRef: paymentIntent.gatewayRef,
      gatewayStatus: paymentIntent.status,
      type: "payment",
      status: "pending",
      metadata: (order.metadata || undefined) as any,
      description: order.description || undefined,
    },
  });

  return paymentIntent;
}

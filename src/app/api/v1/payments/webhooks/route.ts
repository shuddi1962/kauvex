import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import { getGateway } from "@/lib/payments";

export const dynamic = "force-dynamic";

function getGatewayFromEvent(event: string): string | null {
  if (event.startsWith("charge.") || event.startsWith("transfer.")) return "paystack";
  if (event.startsWith("payment.") || event.startsWith("refund.")) return "flutterwave";
  if (event.startsWith("CHECKOUT.") || event.startsWith("PAYMENT.")) return "paypal";
  if (event.includes(".")) return "stripe";
  return null;
}

type WebhookHandler = {
  supported: string[];
  process: (event: string, data: Record<string, unknown>) => Promise<void>;
};

const handlers: Record<string, WebhookHandler> = {
  stripe: {
    supported: [
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "charge.refunded",
    ],
    process: async (event, data) => {
      const intent = data as Record<string, unknown>;
      const gatewayRef = intent.id as string;
      const status =
        event === "payment_intent.succeeded"
          ? "completed"
          : event === "payment_intent.payment_failed"
            ? "failed"
            : "refunded";

      const tx = await prisma.paymentTransaction.findFirst({
        where: { gatewayRef },
      });
      if (!tx) return;

      if (event === "charge.refunded") {
        await prisma.paymentTransaction.update({
          where: { id: tx.id },
          data: { status: "refunded", gatewayStatus: status },
        });
      } else {
        await prisma.paymentTransaction.update({
          where: { id: tx.id },
          data: { status, gatewayStatus: status },
        });

        if (status === "completed" && tx.orderId) {
          await prisma.order.update({
            where: { id: tx.orderId },
            data: { paymentStatus: "paid" },
          });
        }
      }
    },
  },
  paystack: {
    supported: [
      "charge.success",
      "charge.failed",
      "transfer.success",
      "transfer.failed",
    ],
    process: async (event, data) => {
      const payload = data as Record<string, unknown>;
      const gatewayRef = (payload.reference || payload.id) as string;
      const isSuccess = event === "charge.success" || event === "transfer.success";
      const status = isSuccess ? "completed" : "failed";

      const tx = await prisma.paymentTransaction.findFirst({
        where: { gatewayRef: String(gatewayRef) },
      });
      if (!tx) return;

      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: { status, gatewayStatus: status },
      });

      if (isSuccess && tx.orderId && tx.type === "payment") {
        await prisma.order.update({
          where: { id: tx.orderId },
          data: { paymentStatus: "paid" },
        });
      }
    },
  },
  flutterwave: {
    supported: [
      "payment.completed",
      "payment.failed",
      "refund.completed",
    ],
    process: async (event, data) => {
      const payload = data as Record<string, unknown>;
      const txRef = (payload.tx_ref || payload.id) as string;

      const tx = await prisma.paymentTransaction.findFirst({
        where: { gatewayRef: String(txRef) },
      });
      if (!tx) return;

      if (event === "refund.completed") {
        await prisma.paymentTransaction.update({
          where: { id: tx.id },
          data: { status: "refunded", gatewayStatus: "refunded" },
        });
        return;
      }

      const status = event === "payment.completed" ? "completed" : "failed";
      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: { status, gatewayStatus: status },
      });

      if (status === "completed" && tx.orderId && tx.type === "payment") {
        await prisma.order.update({
          where: { id: tx.orderId },
          data: { paymentStatus: "paid" },
        });
      }
    },
  },
  paypal: {
    supported: [
      "CHECKOUT.ORDER.APPROVED",
      "PAYMENT.CAPTURE.COMPLETED",
      "PAYMENT.CAPTURE.DENIED",
      "PAYMENT.CAPTURE.REFUNDED",
    ],
    process: async (event, data) => {
      const resource = data as Record<string, unknown>;

      if (event === "CHECKOUT.ORDER.APPROVED") {
        const orderId = resource.id as string;
        await prisma.paymentTransaction.updateMany({
          where: { gatewayRef: orderId },
          data: { gatewayStatus: "approved" },
        });
        return;
      }

      const captureId = resource.id as string;
      const tx = await prisma.paymentTransaction.findFirst({
        where: { gatewayRef: captureId },
      });
      if (!tx) return;

      if (event === "PAYMENT.CAPTURE.REFUNDED") {
        await prisma.paymentTransaction.update({
          where: { id: tx.id },
          data: { status: "refunded", gatewayStatus: "refunded" },
        });
        return;
      }

      const status = event === "PAYMENT.CAPTURE.COMPLETED" ? "completed" : "failed";
      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: { status, gatewayStatus: status },
      });

      if (status === "completed" && tx.orderId && tx.type === "payment") {
        await prisma.order.update({
          where: { id: tx.orderId },
          data: { paymentStatus: "paid" },
        });
      }
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature =
      request.headers.get("stripe-signature") ||
      request.headers.get("x-paystack-signature") ||
      request.headers.get("verif-hash") ||
      request.headers.get("paypal-transmission-id") ||
      "";

    let gateway: string | null = null;
    let event: string;
    let data: Record<string, unknown>;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const parsed = JSON.parse(body);
      event = (parsed.event || parsed.event_type || parsed["event.type"] || "unknown") as string;
      data = (parsed.data || parsed.resource || parsed) as Record<string, unknown>;
      gateway = getGatewayFromEvent(event);

      if (parsed.charge && parsed.charge.status) {
        gateway = "flutterwave";
        event = parsed.charge.status === "successful" ? "payment.completed" : "payment.failed";
        data = parsed.charge;
      }
    } else {
      const parsed = JSON.parse(body);
      event = "raw";
      data = parsed;
    }

    if (!gateway) return errorResponse("Unrecognized webhook source", 400);

    const handler = handlers[gateway];
    if (!handler) return errorResponse(`No handler for gateway: ${gateway}`, 400);

    if (!handler.supported.includes(event)) {
      return successResponse({ received: true, ignored: event });
    }

    try {
      const gwInstance = getGateway(gateway);
      const verified = await gwInstance.handleWebhook(body, signature);
      event = verified.event;
      data = verified.data;
    } catch {
      return errorResponse("Webhook verification failed", 401);
    }

    await handler.process(event, data);

    return successResponse({ received: true, event });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}

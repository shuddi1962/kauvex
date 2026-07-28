import prisma from "@/lib/prisma";

export async function getVendorConversations(vendorId: string) {
  return prisma.conversation.findMany({
    where: {
      participants: { some: { userId: vendorId, userRole: "vendor" } },
    },
    include: {
      participants: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getConversationMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendMessage(conversationId: string, senderId: string, message: string, senderRole = "vendor") {
  const [msg] = await Promise.all([
    prisma.message.create({
      data: { conversationId, senderId, senderRole, message },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return msg;
}

export async function markConversationRead(conversationId: string, userId: string) {
  return prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

export async function getUnreadCount(vendorId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: vendorId, userRole: "vendor" } } },
    include: { messages: { where: { isRead: false, senderRole: { not: "vendor" } }, select: { id: true } } },
  });
  return conversations.reduce((sum, c) => sum + c.messages.length, 0);
}

export async function createConversation(vendorId: string, customerId: string, title: string, orderId?: string) {
  const conversation = await prisma.conversation.create({
    data: {
      conversationType: orderId ? "order_inquiry" : "general",
      title,
      metadata: orderId ? { orderId } : {},
      participants: {
        create: [
          { userId: vendorId, userRole: "vendor" },
          { userId: customerId, userRole: "customer" },
        ],
      },
    },
  });
  return conversation;
}
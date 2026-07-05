export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: Record<string, string>;
  badge?: number;
}

export const pushTemplates = {
  orderShipped: (data: {
    orderId: string;
    trackingUrl: string;
  }): PushNotificationPayload => ({
    title: `Kauvex: Your order has shipped 🚀`,
    body: `Track your delivery in real-time.`,
    icon: "/icons/icon-192x192.png",
    data: { url: data.trackingUrl, orderId: data.orderId },
  }),

  orderDelivered: (data: { orderId: string }): PushNotificationPayload => ({
    title: `Delivered! Hope you love it ✅`,
    body: `Rate your purchase and earn loyalty points.`,
    icon: "/icons/icon-192x192.png",
    data: { url: `/orders/${data.orderId}/review` },
  }),

  flashSale: (data: {
    discount: string;
    category: string;
  }): PushNotificationPayload => ({
    title: `FLASH SALE: ${data.discount} off ${data.category} ⚡`,
    body: `Limited time only. Shop now!`,
    icon: "/icons/icon-192x192.png",
    image: "/og-image.png",
    data: { url: "/deals" },
  }),

  riderNearby: (data: {
    riderName: string;
    eta: string;
  }): PushNotificationPayload => ({
    title: `Your rider is on the way 🛵`,
    body: `${data.riderName} is ${data.eta} away.`,
    icon: "/icons/icon-192x192.png",
    data: { url: "/track" },
  }),

  newFollower: (data: { followerName: string }): PushNotificationPayload => ({
    title: `New follower! 🎉`,
    body: `${data.followerName} started following you.`,
    icon: "/icons/icon-192x192.png",
    data: { url: "/vendor/dashboard" },
  }),

  priceDrop: (data: {
    productName: string;
    oldPrice: string;
    newPrice: string;
  }): PushNotificationPayload => ({
    title: `Price drop alert! 📉`,
    body: `${data.productName} is now ${data.newPrice} (was ${data.oldPrice}).`,
    icon: "/icons/icon-192x192.png",
    data: { url: "/deals" },
  }),

  liveStreamStarting: (data: {
    streamTitle: string;
    hostName: string;
  }): PushNotificationPayload => ({
    title: `LIVE NOW: ${data.streamTitle} 🔴`,
    body: `${data.hostName} is live. Shop the moment!`,
    icon: "/icons/icon-192x192.png",
    data: { url: "/live" },
  }),

  payoutProcessed: (data: {
    amount: string;
    type: "vendor" | "partner" | "logistics";
  }): PushNotificationPayload => ({
    title: `Payment processed 💰`,
    body: `${data.amount} has been sent to your account.`,
    icon: "/icons/icon-192x192.png",
    data: {
      url:
        data.type === "vendor"
          ? "/vendor/wallet"
          : data.type === "partner"
          ? "/partners/dashboard"
          : "/logistics/earnings",
    },
  }),

  streakMilestone: (data: { streakDay: number; points: number }): PushNotificationPayload => ({
    title: `${data.streakDay} day streak! 🔥`,
    body: data.streakDay % 7 === 0
      ? `Bonus day! You earned ${data.points} points. Keep it up!`
      : `You earned ${data.points} points for checking in today.`,
    icon: "/icons/icon-192x192.png",
    data: { url: "/account/gamification" },
  }),

  achievementUnlocked: (data: { name: string; points: number }): PushNotificationPayload => ({
    title: `Achievement Unlocked! 🏆`,
    body: `"${data.name}" — You earned ${data.points} points!`,
    icon: "/icons/icon-192x192.png",
    data: { url: "/account/gamification" },
  }),

  spinWin: (data: { prize: string; points: number }): PushNotificationPayload => ({
    title: `You won! 🎉`,
    body: `${data.prize} — ${data.points} points added to your account.`,
    icon: "/icons/icon-192x192.png",
    data: { url: "/account/gamification" },
  }),

  referralMilestone: (data: { referrals: number; reward: string }): PushNotificationPayload => ({
    title: `Referral Milestone Reached! 🎯`,
    body: `You've referred ${data.referrals} friends! You earned ${data.reward}.`,
    icon: "/icons/icon-192x192.png",
    data: { url: "/account/referrals" },
  }),

  marketingCampaign: (data: { title: string; body: string; deepLink?: string }): PushNotificationPayload => ({
    title: data.title,
    body: data.body,
    icon: "/icons/icon-192x192.png",
    image: "/og-image.png",
    data: { url: data.deepLink || "/" },
  }),

  pointsReward: (data: { reason: string; points: number }): PushNotificationPayload => ({
    title: `Points earned! ⭐`,
    body: `${data.reason} — +${data.points} points`,
    icon: "/icons/icon-192x192.png",
    data: { url: "/account/gamification" },
  }),
};

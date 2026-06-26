import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_ACCOUNT_ID = "demo-express-account-001";
const DEMO_EMAIL = "express.demo@kauvex.com";
const DEMO_PASSWORD = "KauvexDemo2026!";

const DEMO_SHIPMENTS = [
  {
    waybillNumber: "KVX-EXP-DEMO001",
    senderName: "Adebayo Ogundimu",
    senderPhone: "+234 803 456 7890",
    senderEmail: "adebayo@techstores.ng",
    receiverName: "Chioma Nwosu",
    receiverPhone: "+234 812 345 6789",
    pickupAddress: "15 Admiralty Way, Lekki Phase 1, Lagos",
    pickupCity: "Lagos",
    pickupCountry: "NG",
    dropoffAddress: "42 Wuse Zone 5, Abuja",
    dropoffCity: "Abuja",
    dropoffCountry: "NG",
    contentsType: "Electronics",
    contentsDescription: "iPhone 15 Pro Max, AirPods Pro",
    weightKg: 2.5,
    lengthCm: 30,
    widthCm: 25,
    heightCm: 15,
    declaredValue: 850000,
    serviceLevel: "express",
    pricePaid: 4500,
    status: "delivered",
    paymentStatus: "paid",
    insurancePurchased: true,
    insurancePremium: 8500,
    packagingType: "bubble_mailer",
    packagingSize: "m",
    signatureRequired: true,
  },
  {
    waybillNumber: "KVX-EXP-DEMO002",
    senderName: "Adebayo Ogundimu",
    senderPhone: "+234 803 456 7890",
    senderEmail: "adebayo@techstores.ng",
    receiverName: "Emeka Okafor",
    receiverPhone: "+234 908 765 4321",
    pickupAddress: "15 Admiralty Way, Lekki Phase 1, Lagos",
    pickupCity: "Lagos",
    pickupCountry: "NG",
    dropoffAddress: "7 Trans Amadi, Port Harcourt",
    dropoffCity: "Port Harcourt",
    dropoffCountry: "NG",
    contentsType: "Fashion",
    contentsDescription: "Designer watches, leather wallet set",
    weightKg: 1.2,
    lengthCm: 25,
    widthCm: 20,
    heightCm: 10,
    declaredValue: 320000,
    serviceLevel: "standard",
    pricePaid: 2800,
    status: "in_transit",
    paymentStatus: "paid",
    insurancePurchased: true,
    insurancePremium: 3200,
    packagingType: "standard_box",
    packagingSize: "s",
    signatureRequired: false,
  },
  {
    waybillNumber: "KVX-EXP-DEMO003",
    senderName: "Adebayo Ogundimu",
    senderPhone: "+234 803 456 7890",
    senderEmail: "adebayo@techstores.ng",
    receiverName: "Fatima Abdullahi",
    receiverPhone: "+234 706 123 4567",
    pickupAddress: "15 Admiralty Way, Lekki Phase 1, Lagos",
    pickupCity: "Lagos",
    pickupCountry: "NG",
    dropoffAddress: "23 Kano Road, Kaduna",
    dropoffCity: "Kaduna",
    dropoffCountry: "NG",
    contentsType: "Documents",
    contentsDescription: "Legal documents, contracts",
    weightKg: 0.8,
    lengthCm: 35,
    widthCm: 25,
    heightCm: 2,
    declaredValue: 50000,
    serviceLevel: "economy",
    pricePaid: 1800,
    status: "picked_up",
    paymentStatus: "paid",
    insurancePurchased: false,
    packagingType: "poly_mailer",
    packagingSize: "s",
    signatureRequired: false,
  },
  {
    waybillNumber: "KVX-EXP-DEMO004",
    senderName: "Adebayo Ogundimu",
    senderPhone: "+234 803 456 7890",
    senderEmail: "adebayo@techstores.ng",
    receiverName: "Blessing Eze",
    receiverPhone: "+234 815 987 6543",
    pickupAddress: "15 Admiralty Way, Lekki Phase 1, Lagos",
    pickupCity: "Lagos",
    pickupCountry: "NG",
    dropoffAddress: "10 Allen Avenue, Ikeja, Lagos",
    dropoffCity: "Lagos",
    dropoffCountry: "NG",
    contentsType: "Gift",
    contentsDescription: "Birthday gift hamper, perfume set",
    weightKg: 3.0,
    lengthCm: 40,
    widthCm: 35,
    heightCm: 25,
    declaredValue: 150000,
    serviceLevel: "same_day",
    pricePaid: 6500,
    status: "out_for_delivery",
    paymentStatus: "paid",
    insurancePurchased: true,
    insurancePremium: 1500,
    packagingType: "gift_box",
    packagingSize: "m",
    signatureRequired: true,
  },
  {
    waybillNumber: "KVX-EXP-DEMO005",
    senderName: "Adebayo Ogundimu",
    senderPhone: "+234 803 456 7890",
    senderEmail: "adebayo@techstores.ng",
    receiverName: "Yusuf Bello",
    receiverPhone: "+234 809 876 5432",
    pickupAddress: "15 Admiralty Way, Lekki Phase 1, Lagos",
    pickupCity: "Lagos",
    pickupCountry: "NG",
    dropoffAddress: "5 Marina, Victoria Island, Lagos",
    dropoffCity: "Lagos",
    dropoffCountry: "NG",
    contentsType: "Electronics",
    contentsDescription: "MacBook Pro 14 inch, USB-C hub",
    weightKg: 4.5,
    lengthCm: 45,
    widthCm: 35,
    heightCm: 20,
    declaredValue: 1200000,
    serviceLevel: "express",
    pricePaid: 5500,
    status: "pending",
    paymentStatus: "pending",
    insurancePurchased: true,
    insurancePremium: 12000,
    packagingType: "fragile_pack",
    packagingSize: "m",
    signatureRequired: true,
  },
];

function generateTrackingEvents(status: string, createdAt: Date) {
  const events: { status: string; timestamp: Date; location: string; description: string }[] = [];
  const base = new Date(createdAt);

  events.push({
    status: "created",
    timestamp: new Date(base),
    location: "Lagos, Nigeria",
    description: "Shipment created and payment confirmed",
  });

  if (["picked_up", "in_transit", "out_for_delivery", "delivered"].includes(status)) {
    events.push({
      status: "picked_up",
      timestamp: new Date(base.getTime() + 2 * 60 * 60 * 1000),
      location: "Lekki Phase 1, Lagos",
      description: "Package picked up by courier",
    });
  }

  if (["in_transit", "out_for_delivery", "delivered"].includes(status)) {
    events.push({
      status: "in_transit",
      timestamp: new Date(base.getTime() + 6 * 60 * 60 * 1000),
      location: "Ikeja Hub, Lagos",
      description: "Package arrived at Lagos sorting hub",
    });
    events.push({
      status: "in_transit",
      timestamp: new Date(base.getTime() + 10 * 60 * 60 * 1000),
      location: "Transit Hub, Ogun",
      description: "Package in transit to destination",
    });
  }

  if (["out_for_delivery", "delivered"].includes(status)) {
    events.push({
      status: "out_for_delivery",
      timestamp: new Date(base.getTime() + 22 * 60 * 60 * 1000),
      location: "Destination City",
      description: "Package out for final delivery",
    });
  }

  if (status === "delivered") {
    events.push({
      status: "delivered",
      timestamp: new Date(base.getTime() + 26 * 60 * 60 * 1000),
      location: "Destination Address",
      description: "Delivered — signed by recipient",
    });
  }

  return events;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action = "seed" } = body;

    if (action === "clear") {
      await (prisma as any).expressShipment.deleteMany({
        where: { accountId: DEMO_ACCOUNT_ID },
      });
      await (prisma as any).kspExpressAccount.delete({
        where: { id: DEMO_ACCOUNT_ID },
      });
      return NextResponse.json({ message: "Demo data cleared" });
    }

    // Create or get Supabase Auth user
    let authUserId: string | null = null;
    let authUserCreated = false;
    let authPassword = DEMO_PASSWORD;

    try {
      const admin = createAdminClient();

      // Check if user already exists
      const { data: existingUsers } = await admin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === DEMO_EMAIL);

      if (existingUser) {
        authUserId = existingUser.id;
      } else {
        // Create new auth user
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: {
            full_name: "Adebayo Ogundimu",
            business_name: "Ogundimu Tech Store",
            role: "customer",
          },
        });

        if (createError) {
          console.error("Auth user creation error:", createError.message);
        } else {
          authUserId = newUser?.user?.id ?? null;
          authUserCreated = true;
        }
      }
    } catch (authErr: any) {
      console.error("Auth setup skipped:", authErr.message);
    }

    // Create or get Express account
    const existingAccount = await (prisma as any).kspExpressAccount.findUnique({
      where: { id: DEMO_ACCOUNT_ID },
    });

    let account;
    if (!existingAccount) {
      account = await (prisma as any).kspExpressAccount.create({
        data: {
          id: DEMO_ACCOUNT_ID,
          userId: authUserId,
          accountType: "business",
          businessName: "Ogundimu Tech Store",
          tier: "silver",
          monthlyVolume: 47,
          monthlySpend: 185000,
          volumeDiscountPercent: 5,
          billingType: "per_shipment",
          walletBalance: 25000,
          customWaybillBranding: true,
          apiAccess: true,
          carbonOffsetEnabled: true,
          status: "active",
        },
      });
    } else {
      // Link auth user if we have one and account doesn't have userId
      if (authUserId && !existingAccount.userId) {
        await (prisma as any).kspExpressAccount.update({
          where: { id: DEMO_ACCOUNT_ID },
          data: { userId: authUserId },
        });
      }
      account = { ...existingAccount, userId: authUserId || existingAccount.userId };
    }

    // Create demo shipments
    const createdShipments = [];
    const now = new Date();

    for (let i = 0; i < DEMO_SHIPMENTS.length; i++) {
      const shipmentData = DEMO_SHIPMENTS[i];
      const createdAt = new Date(now.getTime() - (DEMO_SHIPMENTS.length - i) * 2 * 24 * 60 * 60 * 1000);

      const existingShipment = await (prisma as any).expressShipment.findUnique({
        where: { waybillNumber: shipmentData.waybillNumber },
      });

      if (existingShipment) {
        createdShipments.push(existingShipment);
        continue;
      }

      const dimWeight = (shipmentData.lengthCm! * shipmentData.widthCm! * shipmentData.heightCm!) / 5000;
      const chargeableWeight = Math.max(shipmentData.weightKg, dimWeight);

      const shipment = await (prisma as any).expressShipment.create({
        data: {
          waybillNumber: shipmentData.waybillNumber,
          accountId: DEMO_ACCOUNT_ID,
          senderName: shipmentData.senderName,
          senderPhone: shipmentData.senderPhone,
          senderEmail: shipmentData.senderEmail,
          receiverName: shipmentData.receiverName,
          receiverPhone: shipmentData.receiverPhone,
          pickupAddress: shipmentData.pickupAddress,
          pickupCity: shipmentData.pickupCity,
          pickupCountry: shipmentData.pickupCountry,
          dropoffAddress: shipmentData.dropoffAddress,
          dropoffCity: shipmentData.dropoffCity,
          dropoffCountry: shipmentData.dropoffCountry,
          contentsType: shipmentData.contentsType,
          contentsDescription: shipmentData.contentsDescription,
          weightKg: shipmentData.weightKg,
          lengthCm: shipmentData.lengthCm,
          widthCm: shipmentData.widthCm,
          heightCm: shipmentData.heightCm,
          dimensionalWeight: dimWeight,
          chargeableWeight,
          declaredValue: shipmentData.declaredValue,
          currency: "NGN",
          serviceLevel: shipmentData.serviceLevel,
          pricePaid: shipmentData.pricePaid,
          status: shipmentData.status,
          paymentStatus: shipmentData.paymentStatus,
          insurancePurchased: shipmentData.insurancePurchased,
          insurancePremium: shipmentData.insurancePremium,
          packagingType: shipmentData.packagingType,
          packagingSize: shipmentData.packagingSize,
          signatureRequired: shipmentData.signatureRequired,
          isGuest: false,
          createdAt,
        },
      });

      const trackingEvents = generateTrackingEvents(shipmentData.status, createdAt);
      for (const event of trackingEvents) {
        await (prisma as any).kspPlatformEvent.create({
          data: {
            eventType: "order_placed",
            eventData: {
              shipmentId: shipment.id,
              waybillNumber: shipmentData.waybillNumber,
              status: event.status,
              location: event.location,
              description: event.description,
            },
            countryCode: shipmentData.pickupCountry,
            city: shipmentData.pickupCity,
          },
        });
      }

      createdShipments.push(shipment);
    }

    return NextResponse.json({
      message: "Demo Express account seeded successfully",
      account: {
        id: account.id,
        businessName: account.businessName,
        tier: account.tier,
        monthlyVolume: account.monthlyVolume,
        monthlySpend: account.monthlySpend,
        walletBalance: account.walletBalance,
      },
      login: {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        note: authUserCreated
          ? "Auth user created successfully. Use these credentials to log in."
          : authUserId
          ? "Auth user already existed. Use these credentials to log in."
          : "Could not create auth user (missing service role key?). Use Express dashboard directly.",
      },
      dashboard: {
        overview: "/express/dashboard/overview",
        book: "/express/book",
        track: "/express/track",
        analytics: "/express/analytics",
      },
      shipments: createdShipments.map((s: any) => ({
        waybillNumber: s.waybillNumber,
        status: s.status,
        serviceLevel: s.serviceLevel,
        receiverName: s.receiverName,
        dropoffCity: s.dropoffCity,
        pricePaid: s.pricePaid,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to seed demo data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const account = await (prisma as any).kspExpressAccount.findUnique({
      where: { id: DEMO_ACCOUNT_ID },
      include: {
        shipments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Demo account not found. POST to seed." }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch demo data" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: string;
  manufacturer?: {
    companyName: string;
    slug: string;
    countryCode: string;
    city: string;
    businessType: string;
    yearEstablished: number;
    employeeCountRange: string;
    categories: { category: string; isPrimary: boolean; productTypes: string[] }[];
    capability: {
      monthlyCapacity: number;
      defaultMoq: number;
      defaultLeadTimeDays: number;
      allowsOem: boolean;
      allowsOdm: boolean;
      allowsPrivateLabel: boolean;
    };
  };
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "manufacturer@kauvex.com",
    password: "Manufacturer1!",
    name: "Chen Wei",
    role: "manufacturer",
    manufacturer: {
      companyName: "Shenzhen Precision Electronics Co.",
      slug: "shenzhen-precision-electronics",
      countryCode: "CN",
      city: "Shenzhen",
      businessType: "manufacturer",
      yearEstablished: 2012,
      employeeCountRange: "201-500",
      categories: [
        { category: "Electronics & Hardware", isPrimary: true, productTypes: ["USB cables", "power adapters", "wireless chargers", "IoT devices"] },
        { category: "Custom/Promotional Products", isPrimary: false, productTypes: ["branded tech accessories"] },
      ],
      capability: {
        monthlyCapacity: 500000,
        defaultMoq: 500,
        defaultLeadTimeDays: 21,
        allowsOem: true,
        allowsOdm: true,
        allowsPrivateLabel: true,
      },
    },
  },
  {
    email: "wholesale@kauvex.com",
    password: "Wholesale1!",
    name: "James Mitchell",
    role: "customer",
  },
];

async function supabaseAdmin(method: string, path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.headers.get("x-setup-secret");

    if (secret !== process.env.SEED_SECRET && secret !== "demo-setup-2024") {
      return NextResponse.json({ error: "Invalid setup secret" }, { status: 403 });
    }

    const results: { email: string; status: string; userId?: string; error?: string }[] = [];

    for (const account of DEMO_ACCOUNTS) {
      try {
        // 1. Create Supabase Auth user
        const authResult = await supabaseAdmin("signup", "", {
          email: account.email,
          password: account.password,
          data: { name: account.name, role: account.role },
        });

        if (authResult.code) {
          // User might already exist — try to sign in to get the ID
          const loginResult = await supabaseAdmin("token?grant_type=password", "", {
            email: account.email,
            password: account.password,
          });

          if (loginResult.access_token) {
            results.push({ email: account.email, status: "already_exists", userId: loginResult.user?.id });
            continue;
          }

          results.push({ email: account.email, status: "error", error: authResult.msg || authResult.error_description || "Unknown error" });
          continue;
        }

        const userId = authResult.id || authResult.user?.id;

        // 2. Create profile with role
        if (userId) {
          await prisma.profiles.upsert({
            where: { id: userId },
            create: {
              id: userId,
              email: account.email,
              name: account.name,
              role: account.role,
            },
            update: {
              role: account.role,
              name: account.name,
            },
          });

          // 3. Create manufacturer if applicable
          if (account.manufacturer && account.role === "manufacturer") {
            const m = account.manufacturer;

            const existing = await prisma.mfgManufacturer.findUnique({
              where: { slug: m.slug },
            });

            if (!existing) {
              const manufacturer = await prisma.mfgManufacturer.create({
                data: {
                  userId,
                  companyName: m.companyName,
                  slug: m.slug,
                  countryCode: m.countryCode,
                  city: m.city,
                  businessType: m.businessType,
                  yearEstablished: m.yearEstablished,
                  employeeCountRange: m.employeeCountRange,
                  verificationTier: "factory_verified",
                  status: "active",
                  trustScore: 85,
                  responseRate: 98,
                  avgResponseTimeHours: 6,
                  totalOrdersCompleted: 47,
                  ratingAverage: 4.8,
                },
              });

              await prisma.mfgCategory.createMany({
                data: m.categories.map((c) => ({
                  manufacturerId: manufacturer.id,
                  category: c.category,
                  isPrimary: c.isPrimary,
                  productTypes: c.productTypes,
                })),
              });

              await prisma.mfgCapability.create({
                data: {
                  manufacturerId: manufacturer.id,
                  monthlyCapacity: m.capability.monthlyCapacity,
                  defaultMoq: m.capability.defaultMoq,
                  defaultLeadTimeDays: m.capability.defaultLeadTimeDays,
                  allowsOem: m.capability.allowsOem,
                  allowsOdm: m.capability.allowsOdm,
                  allowsPrivateLabel: m.capability.allowsPrivateLabel,
                },
              });

              await prisma.mfgCertification.createMany({
                data: [
                  { manufacturerId: manufacturer.id, certificationType: "ISO 9001", status: "approved" },
                  { manufacturerId: manufacturer.id, certificationType: "CE Marking", status: "approved" },
                  { manufacturerId: manufacturer.id, certificationType: "RoHS", status: "approved" },
                ],
              });

              results.push({ email: account.email, status: "created", userId });
            } else {
              results.push({ email: account.email, status: "manufacturer_exists" });
            }
          } else {
            results.push({ email: account.email, status: "created", userId });
          }
        }
      } catch (err) {
        results.push({ email: account.email, status: "error", error: (err as Error).message });
      }
    }

    return NextResponse.json({
      message: "Demo accounts setup complete",
      results,
      credentials: DEMO_ACCOUNTS.map((a) => ({
        email: a.email,
        password: a.password,
        role: a.role,
        portal: a.role === "manufacturer" ? "/manufacturers/login" : "/wholesale/login",
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Demo Accounts for Kauvex Manufacturer & Wholesale Portals",
    accounts: DEMO_ACCOUNTS.map((a) => ({
      email: a.email,
      password: a.password,
      role: a.role,
      name: a.name,
      portal: a.role === "manufacturer" ? "/manufacturers/login" : "/wholesale/login",
    })),
    setupEndpoint: "POST /api/setup/demo-accounts with { secret: 'demo-setup-2024' }",
  });
}

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const STOREFRONTS = [
  { slug: "uk", domain: "uk.kauvex.com" },
  { slug: "ca", domain: "ca.kauvex.com" },
  { slug: "au", domain: "au.kauvex.com" },
  { slug: "ng", domain: "ng.kauvex.com" },
  { slug: "de", domain: "de.kauvex.com" },
  { slug: "fr", domain: "fr.kauvex.com" },
  { slug: "global", domain: "kauvex.com" },
];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const host = request.headers.get("host")?.replace(/^www\./, "") || "";
  let storefrontId = "global";

  for (const sf of STOREFRONTS) {
    if (host === sf.domain || host.startsWith(sf.slug + ".kauvex.com")) {
      storefrontId = sf.slug;
      break;
    }
  }

  const existing = request.cookies.get("kauvex-storefront")?.value;
  if (!existing || !existing.includes(storefrontId)) {
    response.cookies.set("kauvex-storefront", JSON.stringify({ id: storefrontId }), {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

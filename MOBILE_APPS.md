# Kauvex Native Mobile Apps — Decision Document

## Recommendation: React Native (Expo)

| Factor | React Native (Expo) | Flutter |
|--------|-------------------|---------|
| Code sharing with web | Shares TypeScript types, API client, validation schemas with existing Next.js codebase | Requires Dart — separate codebase, no reuse |
| Developer speed | Expo SDK 52+ has push, camera, biometrics, maps out of the box | Fast but Dart/Widget tree is a new paradigm for the team |
| Team availability | TypeScript developers are abundant in Nigeria and globally | Dart/Flutter developers are harder to hire in Nigerian market |
| Hot reload | Instant with Expo Go | Fast with hot reload |
| Navigation | expo-router (file-based, same mental model as Next.js App Router) | GoRouter — different paradigm |
| Native modules | Expo SDK covers 95% of needs; dev clients for custom | Rich plugin ecosystem (pub.dev) |
| Performance | Hermes engine + new architecture (JSI) matches Flutter in 95% of cases | Slightly better for heavy animations/graphics |
| Cost | Free + EAS Build (paid for CI) | Free |

**Decision**: React Native (Expo) because it reuses the existing TypeScript skill set, the existing API client patterns, and Zod validation schemas currently in `/lib/validators/`. The 5 mobile API routes at `/api/v1/mobile/*` already return properly formatted JSON — no Dart translation layer needed.

---

## 5 Apps to Build (in order)

### 1. Kauvex Customer App (MVP)
**Target**: B2C shoppers across 15 country storefronts
**Features**:
- Product browsing, search, filters, categories
- Cart + checkout (wallet, card, USSD, BNPL)
- Order tracking with live map (uses existing `/api/v1/orders/[id]/tracking` and `/track/[trackingNumber]`)
- Push notifications (infrastructure ready in admin mobile page)
- Wishlist, reviews, returns
- Biometric auth (PIN + fingerprint)
- Offline product browsing

**API routes already built**: customer, orders, tracking, wallet, wishlist, auth
**Build time**: 10-12 weeks (2 developers)

### 2. Kauvex Vendor App
**Target**: 10,000+ marketplace vendors managing inventory, orders, and ads on the go
**Features**:
- Order management (accept, pack, ship, mark delivered)
- Product management (add, edit, inventory counts)
- Sales analytics dashboard (revenue, orders, traffic)
- Ad campaign monitoring (budget, spend, ACOS)
- Push notifications (new order, low stock, payment received)
- Barcode scanning for inventory

**API routes already built**: vendor, orders, inventory, ads
**Build time**: 8-10 weeks (2 developers)

### 3. Kauvex Express Driver App
**Target**: Independent delivery partners (GIG, Kwik, local riders) + Kauvex fleet drivers
**Features**:
- Job assignment with auto-accept
- Turn-by-turn navigation (Google Maps/Mapbox)
- Proof of delivery (photo + signature capture)
- COD collection tracking
- Earnings dashboard with daily/weekly breakdown
- Real-time location sharing (WebSocket)
- QR code scan for pickup/delivery confirmation

**API routes already built**: driver, logistics/jobs, express/waybills, express/tracking
**Build time**: 8-10 weeks (1-2 developers)

### 4. Kauvex Warehouse App
**Target**: FBK warehouse staff — inbound receiving, pick-pack, inventory
**Features**:
- Inbound receiving with barcode scan
- Pick list with optimized route
- Pack station with packaging selector
- Inventory lookup and cycle counting
- Shipment label printing (Bluetooth thermal)
- Stock transfer requests

**API routes already built**: warehouse, fbk, inventory
**Build time**: 6-8 weeks (1-2 developers)

### 5. Kauvex Admin App (Stretch)
**Target**: Platform admins for urgent approvals and monitoring
**Features**:
- Vendor approval queue
- Dispute/escalation response
- Fraud alerts review
- Key metrics dashboard
- Push notification campaign management (exists in web admin)

**API routes already built**: admin
**Build time**: 4-6 weeks (1 developer)

---

## Architecture

```
kauvex-mobile/
├── apps/
│   ├── customer/   (Expo Router app)
│   ├── vendor/     (Expo Router app)
│   ├── driver/     (Expo Router app)
│   ├── warehouse/  (Expo Router app)
│   └── admin/      (Expo Router app)
├── packages/
│   ├── api-client/     (fetch wrapper — reuses Zod types from web)
│   ├── ui/            (shared components — button, card, input, etc.)
│   ├── types/         (shared TypeScript types)
│   └── config/        (env, stores, theme)
└── apps/customer/
    ├── app/            (Expo Router file-based routes)
    ├── components/     (screen-specific components)
    ├── hooks/          (custom hooks)
    └── providers/      (auth, cart, etc.)
```

**Monorepo tool**: Turborepo (same as web project pattern)
**Sharing strategy**: Zod schemas from `/lib/validators/` are published as an npm workspace — mobile apps use the same validation as the web API
**Auth**: JWT from Supabase — mobile gets session token via login API (same as web)

---

## Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Navigation | expo-router (file-based) | Same mental model as Next.js App Router — team already knows it |
| State management | Zustand | Lightweight, TypeScript-native, already used in web |
| Maps | react-native-maps (Google Maps) | Nigeria/15-country coverage, turn-by-turn for drivers |
| Push notifications | Expo Notifications + Firebase Cloud Messaging | Admin push composer already built in web |
| Biometrics | expo-local-authentication | Face ID / fingerprint for vendor PIN |
| Camera/QR | expo-camera + expo-barcode-scanner | Warehouse receiving, delivery confirmation |
| Offline | expo-sqlite + MMKV | Browse products offline, queue orders |
| Payments | Paystack SDK + WebView fallback | Existing Paystack integration in web |
| CI/CD | EAS Build + Submit | Automated builds to TestFlight/Play Store |
| Maps clustering | supercluster (same lib used in `/express/lockers/map`) | Reuse existing logic |

---

## Build Order & Timeline

```
Phase 1 (Weeks 1-12): Customer App MVP
  ├── Week 1-2:  Monorepo setup, auth, API client, navigation shell
  ├── Week 3-4:  Product catalog, search, filters
  ├── Week 5-6:  Cart, checkout (wallet + card + USSD + BNPL)
  ├── Week 7-8:  Order tracking with live map
  ├── Week 9-10: Push notifications, wishlist, reviews
  ├── Week 11:   Biometric auth, offline mode, polish
  └── Week 12:   TestFlight + Play Store beta launch

Phase 2 (Weeks 13-22): Vendor + Driver Apps (parallel)
  ├── Vendor:    Order management, products, analytics, ads
  └── Driver:    Job assignments, navigation, POD, earnings

Phase 3 (Weeks 23-28): Warehouse App
  └── Inbound, pick-pack, inventory, label printing

Phase 4 (Optional): Admin App
  └── Approvals, disputes, fraud alerts
```

**Total**: ~7 months with 2-3 developers
**Cost estimate**: $60k-$90k (Nigeria-based team)

---

## Pre-requisites Before Starting

1. **Apple Developer Account** ($99/yr) + Google Play Console ($25 one-time)
2. **Firebase project** for push notifications (FCM + APNs)
3. **Mapbox API key** (for driver turn-by-turn — free tier covers 50k requests/mo)
4. **EAS Build** subscription ($30/mo for team)
5. **Sentry** mobile SDK setup (already configured for web — extends to mobile)
6. **Paystack** mobile SDK integration (already using Paystack in web)
7. **Design handoff**: Extract Figma component library as a React Native component kit
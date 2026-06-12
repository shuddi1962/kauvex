import { NextResponse } from "next/server";

const apiSpec = {
  openapi: "3.0.3",
  info: {
    title: "KAUVEX Commerce Cloud API",
    version: "1.0.0",
    description: "REST API for the Kauvex multi-vendor marketplace platform. Authenticate via Bearer JWT (user) or x-api-key header (external).",
    contact: { name: "KAUVEX Support", email: "api@kauvex.com" },
  },
  servers: [
    { url: "https://roshana-pi.vercel.app", description: "Production" },
    { url: "http://localhost:3000", description: "Local Development" },
  ],
  security: [
    { bearerAuth: [] },
    { apiKeyAuth: [] },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Supabase JWT token from login" },
      apiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key", description: "API key generated from admin panel" },
    },
    schemas: {
      Storefront: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          currency: { type: "string" },
          currencySymbol: { type: "string" },
          language: { type: "string" },
          countryCode: { type: "string" },
          status: { type: "string", enum: ["active", "inactive", "suspended"] },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          sku: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          compareAtPrice: { type: "number" },
          images: { type: "array", items: { type: "string" } },
          categoryId: { type: "string" },
          brandId: { type: "string" },
          vendorId: { type: "string" },
          status: { type: "string", enum: ["active", "draft", "archived"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string" },
          orderNumber: { type: "string" },
          customerId: { type: "string" },
          vendorId: { type: "string" },
          storefrontId: { type: "string" },
          status: { type: "string", enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] },
          total: { type: "number" },
          currency: { type: "string" },
          shippingAddress: { type: "object" },
          items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "string" },
          productId: { type: "string" },
          name: { type: "string" },
          sku: { type: "string" },
          quantity: { type: "integer" },
          unitPrice: { type: "number" },
          totalPrice: { type: "number" },
        },
      },
      Vendor: {
        type: "object",
        properties: {
          id: { type: "string" },
          storeName: { type: "string" },
          storeSlug: { type: "string" },
          email: { type: "string" },
          description: { type: "string" },
          logo: { type: "string" },
          rating: { type: "number" },
          totalProducts: { type: "integer" },
          totalSales: { type: "integer" },
          status: { type: "string" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/v1/storefronts": {
      get: {
        tags: ["Storefronts"],
        summary: "List active storefronts",
        security: [],
        responses: { "200": { description: "List of storefronts", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Storefront" } } } } } },
      },
    },
    "/api/v1/storefronts/{id}": {
      get: {
        tags: ["Storefronts"],
        summary: "Get storefront details",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Storefront details" } },
      },
    },
    "/api/v1/products": {
      get: {
        tags: ["Products"],
        summary: "List products with filters and pagination",
        security: [],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "vendor", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["relevance", "price_asc", "price_desc", "newest", "top_rated"] } },
        ],
        responses: { "200": { description: "Paginated product list" } },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product (vendor/admin auth)",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Product created" }, "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } },
      },
    },
    "/api/v1/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product details",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product details" } },
      },
      put: {
        tags: ["Products"],
        summary: "Update product (owner auth)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product updated" } },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product (owner auth)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product deleted" } },
      },
    },
    "/api/v1/products/search": {
      get: {
        tags: ["Products"],
        summary: "Search products",
        security: [],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "Search results" } },
      },
    },
    "/api/v1/products/{id}/offers": {
      get: {
        tags: ["Products"],
        summary: "All vendor offers for a product",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "List of vendor offers" } },
      },
    },
    "/api/v1/orders": {
      get: {
        tags: ["Orders"],
        summary: "List orders (own for customer/vendor)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Order list" } },
      },
      post: {
        tags: ["Orders"],
        summary: "Create order",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Order created" } },
      },
    },
    "/api/v1/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order details",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Order details" } },
      },
      put: {
        tags: ["Orders"],
        summary: "Update order status",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" } } } } } },
        responses: { "200": { description: "Order updated" } },
      },
    },
    "/api/v1/orders/{id}/cancel": {
      post: {
        tags: ["Orders"],
        summary: "Cancel order",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Order cancelled" } },
      },
    },
    "/api/v1/orders/{id}/tracking": {
      get: {
        tags: ["Orders"],
        summary: "Get order tracking info",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Tracking information" } },
      },
    },
    "/api/v1/vendors": {
      get: {
        tags: ["Vendors"],
        summary: "List vendors (public)",
        security: [],
        responses: { "200": { description: "Vendor list" } },
      },
    },
    "/api/v1/vendors/register": {
      post: {
        tags: ["Vendors"],
        summary: "Register as vendor",
        security: [],
        responses: { "201": { description: "Vendor registered" } },
      },
    },
    "/api/v1/vendors/{id}": {
      get: {
        tags: ["Vendors"],
        summary: "Get vendor profile (public)",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Vendor profile" } },
      },
      put: {
        tags: ["Vendors"],
        summary: "Update vendor (own auth)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Vendor updated" } },
      },
    },
    "/api/v1/vendors/{id}/products": {
      get: {
        tags: ["Vendors"],
        summary: "Get vendor products",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Vendor products" } },
      },
    },
    "/api/v1/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "Vendor inventory list (vendor auth)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Inventory list" } },
      },
    },
    "/api/v1/inventory/{sku}": {
      put: {
        tags: ["Inventory"],
        summary: "Update inventory quantity (vendor auth)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "sku", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { quantity: { type: "integer" } } } } } },
        responses: { "200": { description: "Inventory updated" } },
      },
    },
    "/api/v1/inventory/fbk/inbound": {
      post: {
        tags: ["Inventory"],
        summary: "Create FBK inbound plan (vendor auth)",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "FBK inbound plan created" } },
      },
    },
    "/api/v1/webhooks": {
      get: {
        tags: ["Webhooks"],
        summary: "List own webhooks (vendor auth)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Webhook list" } },
      },
      post: {
        tags: ["Webhooks"],
        summary: "Create webhook (vendor auth)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { url: { type: "string" }, events: { type: "array", items: { type: "string" } }, secret: { type: "string" } } } } } },
        responses: { "201": { description: "Webhook created" } },
      },
    },
    "/api/v1/webhooks/{id}": {
      put: {
        tags: ["Webhooks"],
        summary: "Update webhook (vendor auth)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Webhook updated" } },
      },
      delete: {
        tags: ["Webhooks"],
        summary: "Delete webhook (vendor auth)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Webhook deleted" } },
      },
    },
    "/api/v1/analytics/overview": {
      get: {
        tags: ["Analytics"],
        summary: "Summary stats (vendor auth)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Analytics overview" } },
      },
    },
    "/api/v1/analytics/orders": {
      get: {
        tags: ["Analytics"],
        summary: "Order metrics (vendor auth)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Order analytics" } },
      },
    },
    "/api/v1/analytics/products": {
      get: {
        tags: ["Analytics"],
        summary: "Product metrics (vendor auth)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Product analytics" } },
      },
    },
    "/api/v1/analytics/search": {
      get: {
        tags: ["Analytics"],
        summary: "Search analytics (vendor auth)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Search analytics" } },
      },
    },
    "/api/v1/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Platform overview (admin auth)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Dashboard data" } },
      },
    },
    "/api/v1/admin/vendors/{id}/approve": {
      post: {
        tags: ["Admin"],
        summary: "Approve vendor (admin auth)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Vendor approved" } },
      },
    },
    "/api/v1/admin/vendors/{id}/suspend": {
      post: {
        tags: ["Admin"],
        summary: "Suspend vendor (admin auth)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Vendor suspended" } },
      },
    },
    "/api/v1/admin/storefronts": {
      get: {
        tags: ["Admin"],
        summary: "All storefronts (admin auth)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Storefront list" } },
      },
    },
    "/api/v1/admin/payouts/run": {
      post: {
        tags: ["Admin"],
        summary: "Trigger payout batch (admin auth)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Payout batch triggered" } },
      },
    },
    "/api/search": {
      get: {
        tags: ["Search"],
        summary: "Full-text product search",
        security: [],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "vendor", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "sort", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "Search results with facets" } },
      },
    },
    "/api/search/autocomplete": {
      get: {
        tags: ["Search"],
        summary: "Search autocomplete",
        security: [],
        parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Autocomplete suggestions" } },
      },
    },
    "/api/buybox": {
      get: {
        tags: ["Buy Box"],
        summary: "Get buy box winner for a product",
        security: [],
        parameters: [{ name: "productId", in: "query", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Buy box winner and offers" } },
      },
    },
    "/api/back-in-stock": {
      post: {
        tags: ["Customers"],
        summary: "Subscribe to back-in-stock notification",
        security: [],
        responses: { "200": { description: "Subscribed" } },
      },
    },
    "/api/call-requests": {
      post: {
        tags: ["Customers"],
        summary: "Request a callback",
        security: [],
        responses: { "201": { description: "Callback request created" } },
      },
    },
    "/api/gift-certificates": {
      post: {
        tags: ["Customers"],
        summary: "Purchase gift certificate",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Gift certificate issued" } },
      },
    },
    "/api/bundles": {
      get: {
        tags: ["Products"],
        summary: "List product bundles",
        security: [],
        responses: { "200": { description: "Bundle list" } },
      },
    },
    "/api/comparisons": {
      post: {
        tags: ["Products"],
        summary: "Save comparison",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Comparison saved" } },
      },
    },
    "/api/ai/description": {
      post: {
        tags: ["AI"],
        summary: "Generate AI product description",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, category: { type: "string" }, features: { type: "string" }, brand: { type: "string" }, language: { type: "string" } } } } } },
        responses: { "200": { description: "Generated description" } },
      },
    },
    "/api/ai/seo": {
      post: {
        tags: ["AI"],
        summary: "Generate AI SEO metadata",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Generated SEO data" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(apiSpec, {
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
  });
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-helpers";
import {
  registerSupplier,
  getSupplierById,
  getSupplierByEmail,
  getAllSuppliers,
  updateSupplierStatus,
  getSupplierProducts,
  createSupplierProduct,
  updateSupplierProduct,
  updateSupplierStock,
  getSupplierOrders,
  confirmSupplierOrder,
  shipSupplierOrder,
  addSupplierCoverage,
  getSupplierCoverage,
  calculateSupplierPayout,
  checkSupplierOrderEscalations,
} from "@/lib/suppliers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const status = searchParams.get("status");
    const include = searchParams.get("include");
    const supplierId = searchParams.get("supplierId");

    if (id) {
      const supplier = await getSupplierById(id);
      if (!supplier) return errorResponse("Supplier not found", 404);
      return successResponse(supplier);
    }

    if (email) {
      const supplier = await getSupplierByEmail(email);
      if (!supplier) return errorResponse("Supplier not found", 404);
      return successResponse(supplier);
    }

    if (supplierId && include === "products") {
      const products = await getSupplierProducts(supplierId);
      return successResponse(products);
    }

    if (supplierId && include === "orders") {
      const orderStatus = searchParams.get("orderStatus") || undefined;
      const orders = await getSupplierOrders(supplierId, orderStatus);
      return successResponse(orders);
    }

    if (supplierId && include === "coverage") {
      const coverage = await getSupplierCoverage(supplierId);
      return successResponse(coverage);
    }

    if (supplierId && include === "payout") {
      const periodStart = searchParams.get("periodStart");
      const periodEnd = searchParams.get("periodEnd");
      const payout = await calculateSupplierPayout(
        supplierId,
        periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd ? new Date(periodEnd) : new Date()
      );
      return successResponse(payout);
    }

    const suppliers = await getAllSuppliers(status || undefined);
    return paginatedResponse(suppliers, suppliers.length, 1, suppliers.length);
  } catch (error) {
    return errorResponse("Failed to fetch suppliers", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "register" || !action) {
      if (!body.businessName || !body.contactPerson || !body.email) {
        return errorResponse("Missing required fields: businessName, contactPerson, email", 400);
      }
      const existing = await getSupplierByEmail(body.email);
      if (existing) return errorResponse("Supplier with this email already exists", 409);
      const supplier = await registerSupplier(body);
      return successResponse(supplier, 201);
    }

    if (action === "create-product") {
      if (!body.supplierId) return errorResponse("Missing required field: supplierId", 400);
      const product = await createSupplierProduct(body);
      return successResponse(product, 201);
    }

    if (action === "add-coverage") {
      if (!body.supplierId || !body.country) {
        return errorResponse("Missing required fields: supplierId, country", 400);
      }
      const coverage = await addSupplierCoverage(body.supplierId, {
        country: body.country,
        state: body.state,
        city: body.city,
      });
      return successResponse(coverage, 201);
    }

    if (action === "run-escalation") {
      const result = await checkSupplierOrderEscalations();
      return successResponse(result);
    }

    return errorResponse("Unknown action", 400);
  } catch (error) {
    return errorResponse("Failed to process supplier request", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "update-status") {
      if (!body.id || !body.status) return errorResponse("Missing required fields: id, status", 400);
      const supplier = await updateSupplierStatus(body.id, body.status);
      return successResponse(supplier);
    }

    if (action === "update-product") {
      if (!body.id) return errorResponse("Missing required field: id", 400);
      const product = await updateSupplierProduct(body.id, body.data);
      return successResponse(product);
    }

    if (action === "update-stock") {
      if (!body.id || body.quantity === undefined) {
        return errorResponse("Missing required fields: id, quantity", 400);
      }
      const product = await updateSupplierStock(body.id, body.quantity);
      return successResponse(product);
    }

    if (action === "confirm-order") {
      if (!body.id) return errorResponse("Missing required field: id", 400);
      const order = await confirmSupplierOrder(body.id);
      return successResponse(order);
    }

    if (action === "ship-order") {
      if (!body.id || !body.trackingNumber || !body.courierName) {
        return errorResponse("Missing required fields: id, trackingNumber, courierName", 400);
      }
      const order = await shipSupplierOrder(body.id, body.trackingNumber, body.courierName);
      return successResponse(order);
    }

    return errorResponse("Unknown action", 400);
  } catch (error) {
    return errorResponse("Failed to update supplier", 500);
  }
}

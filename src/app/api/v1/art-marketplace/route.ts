import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import {
  createArtListing,
  getArtListings,
  getArtListingById,
  addArtLicense,
  purchaseArt,
  getCreatorArtListings,
  getCreatorEarnings,
} from "@/lib/art-marketplace";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const creatorId = searchParams.get("creatorId");
    const include = searchParams.get("include");

    if (id) {
      const listing = await getArtListingById(id);
      if (!listing) return errorResponse("Art listing not found", 404);
      return successResponse(listing);
    }

    if (creatorId && include === "earnings") {
      const earnings = await getCreatorEarnings(creatorId);
      return successResponse(earnings);
    }

    if (creatorId) {
      const listings = await getCreatorArtListings(creatorId);
      return successResponse(listings);
    }

    const listings = await getArtListings(category || undefined);
    return successResponse(listings);
  } catch (error) {
    return errorResponse("Failed to fetch art listings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "create-listing" || !action) {
      if (!body.creatorId || !body.title) {
        return errorResponse("Missing required fields: creatorId, title", 400);
      }
      const listing = await createArtListing(body);
      return successResponse(listing, 201);
    }

    if (action === "add-license") {
      if (!body.listingId || !body.licenseType || !body.price) {
        return errorResponse("Missing required fields: listingId, licenseType, price", 400);
      }
      const license = await addArtLicense(body.listingId, body);
      return successResponse(license, 201);
    }

    if (action === "purchase") {
      if (!body.listingId || !body.licenseId || !body.buyerId || !body.pricePaid) {
        return errorResponse("Missing required fields: listingId, licenseId, buyerId, pricePaid", 400);
      }
      const purchase = await purchaseArt(body);
      return successResponse(purchase, 201);
    }

    return errorResponse("Unknown action", 400);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to process art marketplace request", 500);
  }
}

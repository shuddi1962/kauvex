// Installation Distance + Fee Calculator
// Integrates with Fuel Intelligence System for fuel cost estimation

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface ProfessionalProfile {
  id: string;
  name: string;
  baseLat: number;
  baseLng: number;
  baseRate: number;        // NGN — base installation fee
  freeRadiusKm: number;    // km included in base rate
  travelRatePerKm: number; // NGN per km beyond free radius
  vehicleType: "motorbike" | "car" | "van" | "truck";
  hourlyRate: number;      // NGN per hour
  rating: number;
}

interface JobDetails {
  estimatedDurationHours: number;
  complexity: "standard" | "complex" | "emergency";
  consumablesCost: number;
  requiresMultipleTrips: boolean;
}

interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
  tollCost: number;
}

interface InstallationCostBreakdown {
  baseFee: number;
  distanceSurcharge: number;
  travelTimeCost: number;
  fuelCost: number;
  tollCost: number;
  consumablesCost: number;
  complexitySurcharge: number;
  totalInstallation: number;
  professionalName: string;
  professionalRating: number;
  distanceFromCustomerKm: number;
  estimatedTravelMinutes: number;
  estimatedJobDuration: string;
  vehicleType: string;
}

// Fuel consumption rates by vehicle type (liters per km)
const FUEL_CONSUMPTION: Record<string, number> = {
  motorbike: 0.035,
  car: 0.08,
  van: 0.12,
  truck: 0.25,
};

const COMPLEXITY_MULTIPLIER: Record<string, number> = {
  standard: 1.0,
  complex: 1.5,
  emergency: 2.0,
};

const TOLL_ROUTES_NG: Record<string, { cost: number; route: string }[]> = {
  lagos_mainland: [
    { cost: 300, route: "Lekki-Ikoyi Link Bridge" },
    { cost: 500, route: "Third Mainland Bridge" },
  ],
  lagos_island: [
    { cost: 300, route: "Lekki-Ikoyi Link Bridge" },
  ],
  abuja: [
    { cost: 200, route: "Airport Road Toll" },
  ],
};

async function getDistance(
  origin: Location,
  destination: Location
): Promise<DistanceResult> {
  const R = 6371;
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  const avgSpeedKmph = 30;
  const durationMinutes = Math.round((distanceKm / avgSpeedKmph) * 60);

  return { distanceKm, durationMinutes, tollCost: 0 };
}

async function getFuelPricePerLiter(countryCode: string = "NG"): Promise<number> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/v1/fuel/prices/${countryCode}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.prices && data.prices.length > 0) {
        return data.prices[0].price || 680;
      }
    }
  } catch {
    // Fallback to default
  }
  return countryCode === "NG" ? 680 : 1.5;
}

export async function calculateInstallationCost(
  customerLocation: Location,
  professional: ProfessionalProfile,
  jobDetails: JobDetails,
  countryCode: string = "NG"
): Promise<InstallationCostBreakdown> {
  const professionalLocation: Location = {
    lat: professional.baseLat,
    lng: professional.baseLng,
    address: "Professional Base",
  };

  const distance = await getDistance(professionalLocation, customerLocation);
  const fuelPricePerLiter = await getFuelPricePerLiter(countryCode);

  const roundTripKm = distance.distanceKm * 2;
  const fuelConsumption = FUEL_CONSUMPTION[professional.vehicleType] || 0.08;
  const fuelCost = roundTripKm * fuelConsumption * fuelPricePerLiter;

  const distanceBeyondFree = Math.max(0, distance.distanceKm - professional.freeRadiusKm);
  const distanceSurcharge = distanceBeyondFree * professional.travelRatePerKm;

  const travelTimeCost = (distance.durationMinutes / 60) * professional.hourlyRate * 2;

  const complexitySurcharge =
    professional.baseRate * (COMPLEXITY_MULTIPLIER[jobDetails.complexity] - 1);

  const baseFee = professional.baseRate;
  const tollCost = distance.tollCost;

  const totalInstallation =
    baseFee +
    distanceSurcharge +
    travelTimeCost +
    fuelCost +
    tollCost +
    jobDetails.consumablesCost +
    complexitySurcharge;

  const hours = Math.floor(jobDetails.estimatedDurationHours);
  const mins = Math.round((jobDetails.estimatedDurationHours - hours) * 60);
  const durationStr = `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;

  const totalMinutes = jobDetails.estimatedDurationHours * 60 + distance.durationMinutes * 2;

  return {
    baseFee,
    distanceSurcharge: Math.round(distanceSurcharge),
    travelTimeCost: Math.round(travelTimeCost),
    fuelCost: Math.round(fuelCost),
    tollCost: Math.round(tollCost),
    consumablesCost: jobDetails.consumablesCost,
    complexitySurcharge: Math.round(complexitySurcharge),
    totalInstallation: Math.round(totalInstallation),
    professionalName: professional.name,
    professionalRating: professional.rating,
    distanceFromCustomerKm: Math.round(distance.distanceKm * 10) / 10,
    estimatedTravelMinutes: distance.durationMinutes,
    estimatedJobDuration: durationStr,
    vehicleType: professional.vehicleType,
  };
}

export async function findNearestProfessional(
  customerLocation: Location,
  professionals: ProfessionalProfile[],
  jobDetails: JobDetails,
  countryCode: string = "NG"
): Promise<{ professional: ProfessionalProfile; cost: InstallationCostBreakdown }[]> {
  const results = await Promise.all(
    professionals.map(async (pro) => {
      const cost = await calculateInstallationCost(customerLocation, pro, jobDetails, countryCode);
      return { professional: pro, cost };
    })
  );

  return results.sort((a, b) => a.cost.totalInstallation - b.cost.totalInstallation);
}
import { prisma } from "@/lib/prisma";

// ─── KPN Professional Registration & Profile ───

export async function registerProfessional(data: {
  accountType: "individual" | "company";
  userId: string;
  companyName?: string;
  cacNumber?: string;
  primaryCategory: string;
  secondaryCategories?: string[];
  yearsExperience?: number;
  coverageArea?: any;
  hourlyRate?: number;
  currencyCode?: string;
  bio?: string;
  phone?: string;
  address?: any;
}) {
  return prisma.kpnProfessional.create({
    data: {
      accountType: data.accountType,
      userId: data.userId,
      companyName: data.companyName,
      cacNumber: data.cacNumber,
      primaryCategory: data.primaryCategory,
      secondaryCategories: data.secondaryCategories || [],
      yearsExperience: data.yearsExperience,
      coverageArea: data.coverageArea || {},
      hourlyRate: data.hourlyRate,
      currencyCode: data.currencyCode || "NGN",
      bio: data.bio,
      phone: data.phone,
      address: data.address || {},
      status: "pending",
      verificationTier: "basic",
    },
  });
}

export async function getProfessional(userId: string) {
  return prisma.kpnProfessional.findFirst({ where: { userId } });
}

export async function getProfessionalById(id: string) {
  return prisma.kpnProfessional.findUnique({
    where: { id },
    include: { credentials: true },
  });
}

export async function updateProfessional(id: string, data: any) {
  return prisma.kpnProfessional.update({ where: { id }, data });
}

export async function searchProfessionals(filters: {
  category?: string;
  location?: string;
  tier?: string;
  minRating?: number;
  query?: string;
  page?: number;
  limit?: number;
}) {
  const where: any = { status: "active" };
  if (filters.category) where.primaryCategory = filters.category;
  if (filters.tier) where.verificationTier = filters.tier;
  if (filters.minRating) where.ratingAverage = { gte: filters.minRating };
  if (filters.query) {
    where.OR = [
      { companyName: { contains: filters.query, mode: "insensitive" } },
      { bio: { contains: filters.query, mode: "insensitive" } },
      { primaryCategory: { contains: filters.query, mode: "insensitive" } },
    ];
  }
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const [data, total] = await Promise.all([
    prisma.kpnProfessional.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { ratingAverage: "desc" },
      include: { credentials: { where: { status: "verified" } } },
    }),
    prisma.kpnProfessional.count({ where }),
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getProfessionalDashboard(userId: string) {
  const prof = await prisma.kpnProfessional.findFirst({ where: { userId } });
  if (!prof) return null;
  const [activeJobs, completedJobs, totalEarnings, pendingVerification] = await Promise.all([
    prisma.kpsServiceBooking.count({ where: { professionalId: prof.id, status: { in: ["scheduled", "professional_assigned", "in_progress", "professional_en_route", "checked_in"] } } }),
    prisma.kpsServiceBooking.count({ where: { professionalId: prof.id, status: "completed" } }),
    prisma.kpsServiceBooking.aggregate({ where: { professionalId: prof.id, status: "completed" }, _sum: { professionalPayout: true } }),
    prisma.kpnCredential.count({ where: { professionalId: prof.id, status: "pending" } }),
  ]);
  return { ...prof, activeJobs, completedJobs, totalEarnings: totalEarnings._sum.professionalPayout || 0, pendingVerification };
}

// ─── KPN Credentials ───

export async function addCredential(data: {
  professionalId: string;
  credentialType: string;
  issuingBody?: string;
  certificateNumber?: string;
  documentUrl?: string;
  issueDate?: string;
  expiryDate?: string;
}) {
  return prisma.kpnCredential.create({
    data: {
      professionalId: data.professionalId,
      credentialType: data.credentialType,
      issuingBody: data.issuingBody,
      certificateNumber: data.certificateNumber,
      documentUrl: data.documentUrl,
      issueDate: data.issueDate ? new Date(data.issueDate) : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    },
  });
}

export async function verifyCredential(id: string, adminId: string, status: string) {
  return prisma.kpnCredential.update({
    where: { id },
    data: { status, verifiedBy: adminId, verifiedAt: new Date() },
  });
}

export async function getCredentials(professionalId: string) {
  return prisma.kpnCredential.findMany({ where: { professionalId }, orderBy: { createdAt: "desc" } });
}

// ─── Verification Tier ───

export async function updateVerificationTier(professionalId: string, tier: string) {
  return prisma.kpnProfessional.update({
    where: { id: professionalId },
    data: { verificationTier: tier },
  });
}

export function getRequiredCredentialsForTier(tier: string): string[] {
  switch (tier) {
    case "certified":
      return ["nin", "bvn"];
    case "gold":
      return ["nin", "bvn", "trade_test", "insurance"];
    case "platinum":
      return ["nin", "bvn", "trade_test", "insurance", "cac", "background_check"];
    default:
      return [];
  }
}

// ─── KPS Service Bookings ───

export async function createServiceBooking(data: {
  orderId?: string;
  customerId: string;
  serviceType: string;
  productId?: string;
  serviceAddress?: any;
  scheduledDate?: string;
  scheduledTimeWindow?: string;
  estimatedDurationHours?: number;
  serviceFee: number;
  currencyCode?: string;
  notes?: string;
}) {
  return prisma.kpsServiceBooking.create({
    data: {
      orderId: data.orderId,
      customerId: data.customerId,
      serviceType: data.serviceType,
      productId: data.productId,
      serviceAddress: data.serviceAddress || {},
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      scheduledTimeWindow: data.scheduledTimeWindow,
      estimatedDurationHours: data.estimatedDurationHours,
      serviceFee: data.serviceFee,
      currencyCode: data.currencyCode || "NGN",
      notes: data.notes,
    },
  });
}

export async function assignProfessional(bookingId: string, professionalId: string) {
  const booking = await prisma.kpsServiceBooking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  const prof = await prisma.kpnProfessional.findUnique({ where: { id: professionalId } });
  if (!prof) throw new Error("Professional not found");
  const vendorReferralBonus = booking.vendorReferralBonus || 0;
  const kauvexCommission = booking.serviceFee * 0.2;
  const professionalPayout = booking.serviceFee - kauvexCommission - vendorReferralBonus;
  return prisma.kpsServiceBooking.update({
    where: { id: bookingId },
    data: {
      professionalId,
      professionalPayout,
      kauvexCommission,
      status: "professional_assigned",
    },
  });
}

export async function updateBookingStatus(bookingId: string, status: string, extra?: any) {
  return prisma.kpsServiceBooking.update({
    where: { id: bookingId },
    data: { status, ...extra },
  });
}

export async function completeBooking(bookingId: string, data: {
  customerSignatureUrl?: string;
  completionReportUrl?: string;
  installationCertificateUrl?: string;
  completionTime?: Date;
}) {
  const booking = await prisma.kpsServiceBooking.update({
    where: { id: bookingId },
    data: {
      status: "completed",
      completionTime: data.completionTime || new Date(),
      customerSignatureUrl: data.customerSignatureUrl,
      completionReportUrl: data.completionReportUrl,
      installationCertificateUrl: data.installationCertificateUrl,
    },
  });
  await prisma.kpnProfessional.update({
    where: { id: booking.professionalId! },
    data: { totalJobsCompleted: { increment: 1 } },
  });
  if (booking.productId) {
    await createDigitalTwin({
      ownerId: booking.customerId,
      assetName: `Installation #${bookingId.slice(0, 8)}`,
      assetType: booking.serviceType,
      orderId: booking.orderId,
      installationDate: new Date(),
      installerId: booking.professionalId!,
      documents: [{ type: "installation_certificate", url: data.installationCertificateUrl }],
    });
  }
  return booking;
}

export async function getCustomerBookings(customerId: string) {
  return prisma.kpsServiceBooking.findMany({
    where: { customerId },
    include: { professional: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProfessionalBookings(professionalId: string) {
  return prisma.kpsServiceBooking.findMany({
    where: { professionalId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingStats(professionalId: string) {
  const [total, completed, disputed, earnings] = await Promise.all([
    prisma.kpsServiceBooking.count({ where: { professionalId } }),
    prisma.kpsServiceBooking.count({ where: { professionalId, status: "completed" } }),
    prisma.kpsServiceBooking.count({ where: { professionalId, status: "disputed" } }),
    prisma.kpsServiceBooking.aggregate({ where: { professionalId, status: "completed" }, _sum: { professionalPayout: true } }),
  ]);
  return { total, completed, disputed, completionRate: total > 0 ? (completed / total) * 100 : 0, earnings: earnings._sum.professionalPayout || 0 };
}

// ─── AI Matching Engine ───

export async function matchProfessionals(booking: {
  serviceType: string;
  productId?: string;
  location?: any;
  scheduledDate?: string;
}) {
  const categoryMap: Record<string, string[]> = {
    installation: ["CCTV Installer", "Solar Installer", "Electrician", "AC Technician"],
    assembly: ["Carpenter", "Furniture Assembler", "Cabinet Installer"],
    configuration: ["Network Engineer", "Smart Home Specialist", "ICT Consultant"],
    site_survey: ["Surveyor", "Engineer", "Solar Engineer"],
    calibration: ["Instrument Technician", "Engineer"],
    testing: ["Quality Inspector", "Engineer", "Commissioning Engineer"],
    training: ["Trainer", "Consultant", "Instructor"],
    consultation: ["Consultant", "Engineer", "Architect"],
  };
  const categories = categoryMap[booking.serviceType] || [];
  const professionals = await prisma.kpnProfessional.findMany({
    where: {
      primaryCategory: { in: categories },
      status: "active",
      isAcceptingJobs: true,
      verificationTier: { in: ["certified", "gold", "platinum"] },
    },
    orderBy: [{ verificationTier: "desc" }, { ratingAverage: "desc" }],
    take: 20,
  });
  return professionals;
}

export async function distributeJob(bookingId: string) {
  const booking = await prisma.kpsServiceBooking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  const matches = await matchProfessionals({
    serviceType: booking.serviceType,
    productId: booking.productId || undefined,
    scheduledDate: booking.scheduledDate?.toISOString(),
  });
  return matches;
}

// ─── Digital Twin ───

export async function createDigitalTwin(data: {
  ownerId: string;
  assetName: string;
  assetType: string;
  orderId?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  installationDate?: Date;
  installerId?: string;
  warrantyStart?: Date;
  warrantyEnd?: Date;
  documents?: any[];
}) {
  return prisma.kpnDigitalTwin.create({
    data: {
      ownerId: data.ownerId,
      assetName: data.assetName,
      assetType: data.assetType,
      orderId: data.orderId,
      manufacturer: data.manufacturer,
      model: data.model,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      purchasePrice: data.purchasePrice,
      installationDate: data.installationDate,
      installerId: data.installerId,
      warrantyStart: data.warrantyStart,
      warrantyEnd: data.warrantyEnd,
      documents: data.documents || [],
      ownershipHistory: [{ ownerId: data.ownerId, fromDate: new Date().toISOString() }],
    },
  });
}

export async function getDigitalTwins(ownerId: string) {
  return prisma.kpnDigitalTwin.findMany({
    where: { ownerId },
    include: { maintenanceSched: true, installer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDigitalTwin(id: string) {
  return prisma.kpnDigitalTwin.findUnique({
    where: { id },
    include: { maintenanceSched: { where: { status: "active" } }, installer: true },
  });
}

export async function updateDigitalTwin(id: string, data: any) {
  return prisma.kpnDigitalTwin.update({ where: { id }, data });
}

export async function sellDigitalTwin(twinId: string, askingPrice: number) {
  return prisma.kpnDigitalTwin.update({
    where: { id: twinId },
    data: { isForSale: true, askingPrice },
  });
}

export async function transferDigitalTwin(twinId: string, newOwnerId: string) {
  const twin = await prisma.kpnDigitalTwin.findUnique({ where: { id: twinId } });
  if (!twin) throw new Error("Digital twin not found");
  const history = (twin.ownershipHistory as any[]) || [];
  history.push({ ownerId: newOwnerId, fromDate: new Date().toISOString() });
  return prisma.kpnDigitalTwin.update({
    where: { id: twinId },
    data: { ownerId: newOwnerId, isForSale: false, askingPrice: null, ownershipHistory: history },
  });
}

export async function searchUsedEquipment(filters: { assetType?: string; query?: string; minPrice?: number; maxPrice?: number; page?: number; limit?: number }) {
  const where: any = { isForSale: true };
  if (filters.assetType) where.assetType = filters.assetType;
  if (filters.minPrice || filters.maxPrice) {
    where.askingPrice = {};
    if (filters.minPrice) where.askingPrice.gte = filters.minPrice;
    if (filters.maxPrice) where.askingPrice.lte = filters.maxPrice;
  }
  if (filters.query) {
    where.OR = [
      { assetName: { contains: filters.query, mode: "insensitive" } },
      { manufacturer: { contains: filters.query, mode: "insensitive" } },
      { model: { contains: filters.query, mode: "insensitive" } },
    ];
  }
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const [data, total] = await Promise.all([
    prisma.kpnDigitalTwin.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" }, include: { installer: true } }),
    prisma.kpnDigitalTwin.count({ where }),
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Maintenance Schedule ───

export async function createMaintenanceSchedule(data: {
  digitalTwinId: string;
  maintenanceType: string;
  frequencyDays: number;
  nextDue?: Date;
  reminderDaysBefore?: number;
  autoBook?: boolean;
}) {
  return prisma.kpnMaintenanceSchedule.create({
    data: {
      digitalTwinId: data.digitalTwinId,
      maintenanceType: data.maintenanceType,
      frequencyDays: data.frequencyDays,
      nextDue: data.nextDue || new Date(Date.now() + data.frequencyDays * 86400000),
      reminderDaysBefore: data.reminderDaysBefore || 30,
      autoBook: data.autoBook || false,
    },
  });
}

export async function getMaintenanceSchedules(ownerId: string) {
  return prisma.kpnMaintenanceSchedule.findMany({
    where: { digitalTwin: { ownerId }, status: "active" },
    include: { digitalTwin: true, professional: true },
    orderBy: { nextDue: "asc" },
  });
}

export async function completeMaintenance(scheduleId: string) {
  const sched = await prisma.kpnMaintenanceSchedule.findUnique({ where: { id: scheduleId } });
  if (!sched) throw new Error("Schedule not found");
  const nextDue = new Date(Date.now() + sched.frequencyDays * 86400000);
  return prisma.kpnMaintenanceSchedule.update({
    where: { id: scheduleId },
    data: { lastCompleted: new Date(), nextDue, reminderSent: false },
  });
}

export async function getDueMaintenances(daysAhead: number = 7) {
  const dueDate = new Date(Date.now() + daysAhead * 86400000);
  return prisma.kpnMaintenanceSchedule.findMany({
    where: { status: "active", nextDue: { lte: dueDate }, reminderSent: false },
    include: { digitalTwin: true },
  });
}

// ─── Projects ───

export async function createProject(data: {
  customerId: string;
  projectName: string;
  projectType: string;
  description?: string;
  location?: any;
  budgetMin?: number;
  budgetMax?: number;
  timelineStart?: string;
  timelineEnd?: string;
}) {
  return prisma.kpnProject.create({
    data: {
      customerId: data.customerId,
      projectName: data.projectName,
      projectType: data.projectType,
      description: data.description,
      location: data.location || {},
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      timelineStart: data.timelineStart ? new Date(data.timelineStart) : null,
      timelineEnd: data.timelineEnd ? new Date(data.timelineEnd) : null,
    },
  });
}

export async function getProjects(customerId: string) {
  return prisma.kpnProject.findMany({
    where: { customerId },
    include: { bids: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(id: string) {
  return prisma.kpnProject.findUnique({
    where: { id },
    include: { bids: { include: { professional: true } } },
  });
}

export async function updateProject(id: string, data: any) {
  return prisma.kpnProject.update({ where: { id }, data });
}

export async function submitBid(data: {
  projectId: string;
  professionalId: string;
  bidAmount: number;
  proposedStart?: string;
  proposedEnd?: string;
  methodology?: string;
  teamComposition?: any[];
  equipmentList?: any[];
  paymentSchedule?: any[];
}) {
  return prisma.kpnProjectBid.create({
    data: {
      projectId: data.projectId,
      professionalId: data.professionalId,
      bidAmount: data.bidAmount,
      proposedStart: data.proposedStart ? new Date(data.proposedStart) : null,
      proposedEnd: data.proposedEnd ? new Date(data.proposedEnd) : null,
      methodology: data.methodology,
      teamComposition: data.teamComposition || [],
      equipmentList: data.equipmentList || [],
      paymentSchedule: data.paymentSchedule || [],
    },
  });
}

export async function awardBid(bidId: string) {
  const bid = await prisma.kpnProjectBid.update({
    where: { id: bidId },
    data: { status: "awarded" },
    include: { project: true },
  });
  await prisma.kpnProject.update({
    where: { id: bid.projectId },
    data: { status: "contractor_selected" },
  });
  return bid;
}

// ─── AI Project Analysis ───

export function aiAnalyzeProject(projectType: string, description?: string) {
  const typeMap: Record<string, { professionals: string[]; materialCategories: string[] }> = {
    residential_construction: {
      professionals: ["Architect", "Structural Engineer", "Quantity Surveyor", "Building Contractor", "Electrician", "Plumber", "Tiles/Finishes Specialist", "POP Specialist", "Painter"],
      materialCategories: ["cement", "iron_rods", "blocks", "roofing", "tiles", "paint", "electrical", "plumbing"],
    },
    commercial_construction: {
      professionals: ["Architect", "Structural Engineer", "Project Manager", "Building Contractor", "Electrician", "Plumber", "HVAC Specialist", "Fire Safety Engineer"],
      materialCategories: ["cement", "steel", "blocks", "roofing", "tiles", "glass", "electrical", "plumbing", "hvac"],
    },
    energy: {
      professionals: ["Solar Engineer", "Solar Installer", "Electrical Engineer", "Battery Specialist"],
      materialCategories: ["solar_panels", "inverters", "batteries", "charge_controllers", "cables"],
    },
    marine: {
      professionals: ["Naval Architect", "Marine Engineer", "Boat Builder", "Marine Electrician"],
      materialCategories: ["marine_plywood", "fiberglass", "engines", "navigation", "safety"],
    },
    it_infrastructure: {
      professionals: ["Network Engineer", "Data Center Engineer", "Fiber Optic Technician", "Cybersecurity Consultant"],
      materialCategories: ["servers", "networking", "cables", "ups", "cooling"],
    },
    industrial: {
      professionals: ["Mechanical Engineer", "Industrial Electrician", "Automation Engineer", "Safety Officer"],
      materialCategories: ["machinery", "conveyors", "electrical", "steel", "safety"],
    },
    dredging: {
      professionals: ["Dredging Engineer", "Hydrographic Surveyor", "Dredger Operator", "Environmental Consultant"],
      materialCategories: ["pumps", "pipes", "survey_equipment", "fuel"],
    },
    agriculture: {
      professionals: ["Agricultural Engineer", "Irrigation Specialist", "Farm Consultant", "Greenhouse Builder"],
      materialCategories: ["irrigation", "greenhouses", "pumps", "feeders", "tractors"],
    },
  };
  return typeMap[projectType] || { professionals: ["Engineer", "Project Manager"], materialCategories: ["general"] };
}

// ─── AI BOQ/Material Calculator ───

export function aiCalculateMaterials(projectType: string, specs: { dimensions?: string; floors?: number; sqm?: number; specification?: string }) {
  const calculators: Record<string, any> = {
    residential_construction: {
      cement: { unit: "bags", perUnit: (specs.sqm || 180) * 2.1 },
      sand: { unit: "tons", perUnit: (specs.sqm || 180) * 0.08 },
      granite: { unit: "tons", perUnit: (specs.sqm || 180) * 0.1 },
      blocks: { unit: "units", perUnit: (specs.sqm || 180) * 40 },
      iron_rods: { unit: "tonnes", perUnit: (specs.sqm || 180) * 0.033 },
      roofing_sheets: { unit: "sqm", perUnit: (specs.sqm || 180) * 1.2 },
    },
    energy: {
      solar_panels: { unit: "units", perUnit: Math.ceil(((specs.sqm || 50) * 0.15) / 0.4) },
      inverter: { unit: "unit", perUnit: 1 },
      batteries: { unit: "units", perUnit: Math.ceil((specs.sqm || 50) * 0.04) },
    },
  };
  return calculators[projectType] || null;
}

// ─── AI Configurators ───

export function boatConfigurator(config: any) {
  const { vesselType, length, beam, propulsion, hullMaterial } = config;
  const costRanges: Record<string, [number, number]> = {
    "Fishing Boat": length ? [length * 150000, length * 250000] : [1500000, 5000000],
    "Patrol / Security Boat": length ? [length * 300000, length * 500000] : [5000000, 20000000],
    "Ferry / Passenger Boat": length ? [length * 200000, length * 350000] : [5000000, 30000000],
    "Luxury Yacht": length ? [length * 500000, length * 1000000] : [20000000, 100000000],
    "Speed Boat": length ? [length * 250000, length * 400000] : [3000000, 15000000],
  };
  const range = costRanges[vesselType] || [3000000, 10000000];
  const materials = [
    ...(hullMaterial ? [{ name: `${hullMaterial} Hull`, qty: 1, unit: "set", estimatedCost: range[0] * 0.3 }] : []),
    ...(propulsion ? [{ name: `Propulsion: ${propulsion}`, qty: 1, unit: "set", estimatedCost: range[0] * 0.25 }] : []),
    { name: "Navigation Electronics", qty: 1, unit: "set", estimatedCost: range[0] * 0.1 },
    { name: "Safety Equipment", qty: 1, unit: "set", estimatedCost: range[0] * 0.05 },
    { name: "Fittings and Finishing", qty: 1, unit: "set", estimatedCost: range[0] * 0.2 },
  ];
  return {
    specSummary: { vesselType, length, beam, hullMaterial, propulsion },
    costEstimateMin: range[0],
    costEstimateMax: range[1],
    billOfMaterials: materials,
    buildDuration: length ? `${Math.ceil(length / 2)}-${Math.ceil(length / 1.5)} weeks` : "12-24 weeks",
    suggestedBuilders: ["Marine Hub verified boat builders"],
  };
}

export function solarConfigurator(config: any) {
  const { systemType, dailyConsumption, location } = config;
  const dailyKwh = dailyConsumption || 10;
  const systemSizeKw = dailyKwh / 4.5; // 4.5 peak sun hours average
  const panelCount = Math.ceil(systemSizeKw * 1000 / 400);
  const batteryKwh = dailyKwh * 0.7;
  const inverterKva = Math.ceil(systemSizeKw * 0.8);
  return {
    specSummary: { systemSizeKw, panelCount, batteryKwh, inverterKva, location, systemType },
    billOfMaterials: [
      { name: `Solar Panels 400W`, qty: panelCount, unit: "units", estimatedCost: panelCount * 120000 },
      { name: `Inverter ${inverterKva}kVA`, qty: 1, unit: "unit", estimatedCost: inverterKva * 150000 },
      { name: `Battery Bank ${batteryKwh}kWh`, qty: Math.ceil(batteryKwh / 5), unit: "units", estimatedCost: Math.ceil(batteryKwh / 5) * 450000 },
      { name: "Charge Controller", qty: 1, unit: "unit", estimatedCost: 150000 },
      { name: "Mounting Structure", qty: 1, unit: "set", estimatedCost: panelCount * 15000 },
      { name: "Cables & Accessories", qty: 1, unit: "set", estimatedCost: 100000 },
    ],
    costEstimateMin: panelCount * 120000 + inverterKva * 150000 + Math.ceil(batteryKwh / 5) * 450000,
    costEstimateMax: panelCount * 150000 + inverterKva * 180000 + Math.ceil(batteryKwh / 5) * 550000,
    paybackPeriod: `Approximately ${Math.ceil((panelCount * 120000) / (dailyKwh * 30 * 200))} months`,
  };
}

export function cctvConfigurator(config: any) {
  const { propertyType, floors, cameras, retentionDays } = config;
  const camCount = cameras || 8;
  const nvrChannels = Math.ceil(camCount / 8) * 8;
  const storageTb = Math.ceil(camCount * (camCount > 4 ? 0.5 : 0.25) * (retentionDays || 30) / 30);
  return {
    specSummary: { propertyType, floors, cameras: camCount, nvrChannels, storageTb },
    billOfMaterials: [
      { name: `IP Cameras ${camCount}MP`, qty: camCount, unit: "units", estimatedCost: camCount * 45000 },
      { name: `NVR ${nvrChannels}-channel`, qty: 1, unit: "unit", estimatedCost: nvrChannels * 25000 },
      { name: `Hard Drive ${storageTb}TB`, qty: Math.ceil(storageTb / 4), unit: "units", estimatedCost: Math.ceil(storageTb / 4) * 120000 },
      { name: `PoE Switch ${nvrChannels}-port`, qty: 1, unit: "unit", estimatedCost: Math.ceil(nvrChannels / 8) * 35000 },
      { name: "CAT6 Cable (per meter)", qty: Math.max(100, camCount * 15), unit: "meters", estimatedCost: Math.max(100, camCount * 15) * 500 },
      { name: "UPS Backup", qty: 1, unit: "unit", estimatedCost: 80000 },
    ],
    costEstimateMin: camCount * 45000 + nvrChannels * 25000 + Math.ceil(storageTb / 4) * 120000,
    costEstimateMax: camCount * 65000 + nvrChannels * 35000 + Math.ceil(storageTb / 4) * 180000,
  };
}

export function houseConfigurator(config: any) {
  const { buildingType, bedrooms, sqm, finishes } = config;
  const sqmValue = sqm || (buildingType === "bungalow" ? 120 : 200);
  const costPerSqm: Record<string, number> = { basic: 120000, standard: 180000, premium: 280000, luxury: 450000 };
  const perSqm = costPerSqm[finishes || "standard"] || 180000;
  return {
    specSummary: { buildingType, bedrooms, sqm: sqmValue, finishes },
    costEstimateMin: sqmValue * perSqm * 0.9,
    costEstimateMax: sqmValue * perSqm * 1.2,
    billOfMaterials: [
      { name: "Cement", qty: Math.ceil(sqmValue * 2.1), unit: "bags" },
      { name: "Iron Rods", qty: Math.ceil(sqmValue * 0.033), unit: "tonnes" },
      { name: "Blocks", qty: Math.ceil(sqmValue * 40), unit: "units" },
      { name: "Roofing Sheets", qty: Math.ceil(sqmValue * 1.2), unit: "sqm" },
      { name: "Tiles", qty: Math.ceil(sqmValue * 0.6), unit: "sqm" },
      { name: "Paint", qty: Math.ceil(sqmValue * 0.3), unit: "liters" },
    ],
    buildDuration: `${Math.ceil(sqmValue / 30)}-${Math.ceil(sqmValue / 20)} months`,
  };
}

export function kitchenConfigurator(config: any) {
  const { shape, lengthM, widthM, cabinetDoors, countertop } = config;
  const perimeter = 2 * ((lengthM || 4) + (widthM || 3));
  return {
    specSummary: { shape, dimensions: `${lengthM || 4}m x ${widthM || 3}m`, cabinetDoors, countertop },
    billOfMaterials: [
      { name: `Base Cabinets (${cabinetDoors || "MDF painted"})`, qty: 1, unit: "set", estimatedCost: perimeter * 35000 },
      { name: `Upper Cabinets`, qty: 1, unit: "set", estimatedCost: perimeter * 25000 },
      { name: `Countertop (${countertop || "Granite"})`, qty: 1, unit: "sqm", estimatedCost: (lengthM || 4) * 0.6 * 45000 },
      { name: "Appliances", qty: 1, unit: "set", estimatedCost: 500000 },
      { name: "Lighting & Accessories", qty: 1, unit: "set", estimatedCost: 150000 },
    ],
    costEstimateMin: perimeter * 60000 + 650000,
    costEstimateMax: perimeter * 90000 + 900000,
  };
}

export function dredgingConfigurator(config: any) {
  const { lengthKm, widthM, targetDepthM, soilType } = config;
  const volumeM3 = lengthKm * 1000 * widthM * targetDepthM;
  const costPerM3: Record<string, number> = { "Soft silt": 1500, Sandy: 2000, Clay: 3500, "Hard soil": 5000, Mixed: 2500 };
  const perM3 = costPerM3[soilType || "Mixed"] || 2500;
  return {
    specSummary: { lengthKm, widthM, targetDepthM, soilType, volumeM3 },
    costEstimateMin: volumeM3 * perM3 * 0.9,
    costEstimateMax: volumeM3 * perM3 * 1.3,
    estimatedDuration: `${Math.ceil(volumeM3 / 5000)}-${Math.ceil(volumeM3 / 3000)} days`,
    equipmentNeeded: [
      { name: "Dredger (appropriate size)", qty: 1, unit: "unit" },
      { name: "Barges", qty: Math.ceil(lengthKm / 2), unit: "units" },
      { name: "HDPE Discharge Pipes", qty: Math.ceil(lengthKm * 1000 / 12), unit: "lengths" },
      { name: "Survey Equipment", qty: 1, unit: "set" },
    ],
  };
}

// ─── Industry Hubs ───

export async function getIndustryHubs() {
  return prisma.kpnIndustryHub.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getIndustryHub(slug: string) {
  return prisma.kpnIndustryHub.findUnique({ where: { hubSlug: slug } });
}

export async function createIndustryHub(data: {
  hubName: string;
  hubSlug: string;
  subdomain?: string;
  description?: string;
  productCategories?: string[];
  professionalCategories?: string[];
  configuratorsAvailable?: string[];
  pillarsAvailable?: string[];
  sortOrder?: number;
}) {
  return prisma.kpnIndustryHub.create({
    data: {
      hubName: data.hubName,
      hubSlug: data.hubSlug,
      subdomain: data.subdomain,
      description: data.description,
      productCategories: data.productCategories || [],
      professionalCategories: data.professionalCategories || [],
      configuratorsAvailable: data.configuratorsAvailable || [],
      pillarsAvailable: data.pillarsAvailable || [],
      sortOrder: data.sortOrder || 0,
    },
  });
}

// ─── AI Smart Recommendation (KPS1.4) ───

export function aiRecommendService(product: { title: string; category: string; weight?: number; voltage?: string }) {
  const serviceTriggers: Record<string, { serviceType: string; confidence: number }[]> = {
    cctv: [
      { serviceType: "installation", confidence: 0.95 },
      { serviceType: "site_survey", confidence: 0.8 },
      { serviceType: "configuration", confidence: 0.9 },
    ],
    solar: [
      { serviceType: "installation", confidence: 0.95 },
      { serviceType: "site_survey", confidence: 0.9 },
      { serviceType: "training", confidence: 0.6 },
    ],
    inverter: [
      { serviceType: "installation", confidence: 0.9 },
      { serviceType: "configuration", confidence: 0.8 },
    ],
    generator: [
      { serviceType: "installation", confidence: 0.85 },
      { serviceType: "testing", confidence: 0.7 },
    ],
    ac: [
      { serviceType: "installation", confidence: 0.9 },
      { serviceType: "calibration", confidence: 0.7 },
    ],
    furniture: [
      { serviceType: "assembly", confidence: 0.9 },
    ],
    smart_home: [
      { serviceType: "installation", confidence: 0.9 },
      { serviceType: "configuration", confidence: 0.85 },
      { serviceType: "training", confidence: 0.7 },
    ],
  };
  const cat = product.category?.toLowerCase() || "";
  for (const [key, services] of Object.entries(serviceTriggers)) {
    if (cat.includes(key)) return services;
  }
  if (product.weight && product.weight > 50) {
    return [{ serviceType: "installation", confidence: 0.6 }];
  }
  return [];
}

export function aiCrossSell(category: string) {
  const crossSell: Record<string, { name: string; reason: string }[]> = {
    cctv: [
      { name: "NVR Storage Device", reason: "Required for camera recording" },
      { name: "CAT6 Cables (per meter)", reason: "Needed for camera connectivity" },
      { name: "PoE Switch", reason: "Powers cameras over ethernet" },
      { name: "UPS Backup", reason: "Ensures system stays on during power cuts" },
    ],
    solar: [
      { name: "Solar Cables", reason: "Connects panels to inverter" },
      { name: "MC4 Connectors", reason: "Required for panel wiring" },
      { name: "Breaker Panel", reason: "Safety disconnection" },
    ],
  };
  return crossSell[category] || [];
}

// ─── Financing Marketplace ───

export function getFinancingOptions(amount: number, termMonths: number) {
  return [
    { lender: "Kauvex Finance", rate: "18% per annum", termMonths, monthlyPayment: Math.ceil(amount * (1 + 0.18 * termMonths / 12) / termMonths), maxTenure: 60, type: "asset_finance" },
    { lender: "Partner Bank A", rate: "21% per annum", termMonths: Math.min(termMonths, 48), monthlyPayment: Math.ceil(amount * (1 + 0.21 * Math.min(termMonths, 48) / 12) / Math.min(termMonths, 48)), maxTenure: 48, type: "asset_finance" },
    { lender: "Partner Bank B", rate: "15% per annum", termMonths: Math.min(termMonths, 24), monthlyPayment: Math.ceil(amount * (1 + 0.15 * Math.min(termMonths, 24) / 12) / Math.min(termMonths, 24)), maxTenure: 24, type: "asset_finance" },
    { lender: "Microfinance Co", rate: "24% per annum", termMonths: Math.min(termMonths, 12), monthlyPayment: Math.ceil(amount * (1 + 0.24 * Math.min(termMonths, 12) / 12) / Math.min(termMonths, 12)), maxTenure: 12, type: "microfinance" },
  ];
}

// ─── Insurance Marketplace ───

export function getInsuranceQuotes(assetType: string, value: number) {
  const quotes: Record<string, { insurer: string; premium: number; type: string }[]> = {
    marine: [
      { insurer: "Marine Insurance Co", premium: Math.ceil(value * 0.025), type: "hull_and_machinery" },
      { insurer: "Global Marine Underwriters", premium: Math.ceil(value * 0.03), type: "comprehensive_marine" },
    ],
    equipment: [
      { insurer: "Equipment Insurance Ltd", premium: Math.ceil(value * 0.018), type: "accidental_damage" },
      { insurer: "Industrial Insure", premium: Math.ceil(value * 0.022), type: "comprehensive_equipment" },
    ],
    construction: [
      { insurer: "Builders Insurance Co", premium: Math.ceil(value * 0.015), type: "construction_all_risk" },
    ],
    solar: [
      { insurer: "Green Energy Insure", premium: Math.ceil(value * 0.02), type: "system_cover" },
    ],
  };
  return quotes[assetType] || [{ insurer: "General Insurance Co", premium: Math.ceil(value * 0.02), type: "standard_cover" }];
}

// ─── Marketplace Systems ───

export const EQUIPMENT_RENTAL_CATEGORIES = [
  "Construction Equipment", "Marine Equipment", "Industrial Machinery",
  "Agricultural Machinery", "Security Equipment", "ICT Equipment",
  "Power & Energy Equipment", "Transportation Equipment",
];

export const AUCTION_CATEGORIES = [
  "Industrial Machinery", "Marine Vessels", "Construction Equipment",
  "Factory Equipment", "Vehicle Fleet", "Project Surplus",
  "Office Equipment", "Raw Materials",
];

export const WORKFORCE_CATEGORIES = [
  { name: "Marine Crew", roles: ["Captain", "Engineer", "Deckhand", "Cook", "Crane Operator"] },
  { name: "Construction", roles: ["Site Supervisor", "Safety Officer", "Scaffolder", "Crane Operator"] },
  { name: "Oil & Gas", roles: ["Offshore Worker", "Pipeline Inspector", "HSE Officer", "Driller"] },
  { name: "Industrial", roles: ["Factory Worker", "Machine Operator", "Quality Controller", "Shift Supervisor"] },
  { name: "Agriculture", roles: ["Farm Manager", "Irrigation Technician", "Harvest Worker"] },
];

export const COMPLIANCE_CATEGORIES: Record<string, { name: string; description: string }[]> = {
  marine: [
    { name: "Vessel Registration", description: "NIMASA vessel registration and documentation" },
    { name: "Survey Certificates", description: "Annual and special survey requirements" },
    { name: "Crew Certifications", description: "STCW and marine crew competency requirements" },
  ],
  construction: [
    { name: "Building Permit", description: "Local government building permit application" },
    { name: "COREN Registration", description: "Council for Regulation of Engineering in Nigeria" },
    { name: "Fire Safety Clearance", description: "Fire service inspection and clearance" },
  ],
  energy: [
    { name: "NERC License", description: "Nigerian Electricity Regulatory Commission requirements" },
    { name: "SON Approval", description: "Standards Organisation of Nigeria certification" },
    { name: "Environmental Impact", description: "EIA for solar farms and large installations" },
  ],
  dredging: [
    { name: "EIA Requirements", description: "Environmental Impact Assessment for dredging" },
    { name: "NIMASA Permit", description: "Dredging permit from maritime authority" },
    { name: "NEMA Approval", description: "National Environmental Management approval" },
  ],
};

// ─── Industry ERP Lite ───

export function generateERPTemplates(industryType: string) {
  return {
    inventory: { reorderPointPercent: 20, lowStockAlert: true, deadStockDays: 180 },
    procurement: { autoPOCreation: true, threeWayMatching: true },
    finance: { taxRate: 7.5, currency: "NGN", fiscalYearStart: "2026-01-01" },
    workforce: { enableTimesheets: true, enableAttendance: true },
    equipment: { enableMaintenance: true, enableFuelTracking: industryType === "marine" },
    modules: [
      "inventory", "procurement", "sales", "projects", "workforce",
      "equipment", "finance", "crm", "documents", "analytics",
    ],
  };
}
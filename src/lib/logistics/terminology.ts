type DeliveryTier = 'TIER_1_LOCAL' | 'TIER_2_DOMESTIC_FREIGHT' | 'TIER_3_INTERNATIONAL';
type TransportMode = 'air' | 'sea' | 'road';

interface DocumentTypeParams {
  tier?: DeliveryTier;
  isMultiItem?: boolean;
  isInternational?: boolean;
  transportMode?: TransportMode;
  declaredValue?: number;
}

export const DOCUMENT_TYPES = {
  SHIPPING_LABEL: 'Shipping Label',
  WAYBILL: 'Waybill',
  CONSIGNMENT_NOTE: 'Consignment Note',
  AIR_WAYBILL: 'Air Waybill (AWB)',
  BILL_OF_LADING: 'Bill of Lading (BOL)',
  PACKING_LIST: 'Packing List',
  COMMERCIAL_INVOICE: 'Commercial Invoice',
  CN22: 'CN22',
  CN23: 'CN23',
} as const;

const TIER_DOCUMENT_MAP: Record<string, string> = {
  TIER_1_LOCAL: DOCUMENT_TYPES.SHIPPING_LABEL,
  TIER_2_DOMESTIC_FREIGHT: DOCUMENT_TYPES.CONSIGNMENT_NOTE,
};

export function getDocumentType(params: DocumentTypeParams): string {
  const { tier, isMultiItem, isInternational, transportMode, declaredValue } = params;

  if (isMultiItem) {
    return DOCUMENT_TYPES.PACKING_LIST;
  }

  if (isInternational) {
    if (transportMode === 'sea') {
      return DOCUMENT_TYPES.BILL_OF_LADING;
    }
    if (transportMode === 'air') {
      return DOCUMENT_TYPES.AIR_WAYBILL;
    }

    if (declaredValue !== undefined && declaredValue <= 300) {
      return DOCUMENT_TYPES.CN22;
    }
    if (declaredValue !== undefined && declaredValue > 300) {
      return DOCUMENT_TYPES.CN23;
    }

    return DOCUMENT_TYPES.COMMERCIAL_INVOICE;
  }

  if (tier && TIER_DOCUMENT_MAP[tier]) {
    return TIER_DOCUMENT_MAP[tier];
  }

  return DOCUMENT_TYPES.SHIPPING_LABEL;
}

export function getWaybillLabel(isExpress: boolean): string {
  return isExpress ? DOCUMENT_TYPES.WAYBILL : DOCUMENT_TYPES.CONSIGNMENT_NOTE;
}

export type { DocumentTypeParams, DeliveryTier, TransportMode };

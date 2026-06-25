import { BRAND } from "@/components/ui/brand-tokens";

export interface ShippingLabelData {
  orderId: string;
  trackingNumber: string;
  from: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  to: {
    name: string;
    address: string;
    addressLine2?: string;
    city: string;
    state: string;
    phone: string;
  };
  weight: string;
  sizeClass: string;
  serviceLevel: string;
  qrCodeUrl: string;
}

export function generateShippingLabelHtml(data: ShippingLabelData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; width: 148mm; height: 105mm; }
        .label { width: 148mm; height: 105mm; padding: 0; position: relative; }
        .header { background: #0A1628; color: white; padding: 8mm 10mm; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 20px; font-weight: 900; letter-spacing: 3px; }
        .service-badge { background: #FF6B00; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .content { display: flex; padding: 6mm 10mm; gap: 8mm; }
        .from-col { flex: 0 0 38%; }
        .to-col { flex: 1; }
        .label-text { font-size: 9px; color: #64748B; text-transform: uppercase; font-weight: 600; margin-bottom: 2mm; }
        .name { font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 1mm; }
        .address { font-size: 11px; color: #475569; line-height: 1.5; }
        .footer { background: #F5F7FA; padding: 5mm 10mm; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #E2E8F0; }
        .tracking { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #0A1628; }
        .qr { width: 20mm; height: 20mm; }
        .meta { font-size: 9px; color: #64748B; }
        .bottom-strip { height: 4px; background: #FF6B00; }
        .disclaimer { font-size: 7px; color: #94A3B8; text-align: center; padding: 2mm 10mm; }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="header">
          <div class="logo">KAUVEX</div>
          <div class="service-badge">${data.serviceLevel}</div>
        </div>
        <div class="content">
          <div class="from-col">
            <div class="label-text">From</div>
            <div class="name">${data.from.name}</div>
            <div class="address">${data.from.address}<br>${data.from.city}, ${data.from.state}</div>
          </div>
          <div class="to-col">
            <div class="label-text">To</div>
            <div class="name" style="font-size:16px;">${data.to.name}</div>
            <div class="address" style="font-size:13px;">
              ${data.to.address}<br>
              ${data.to.addressLine2 ? data.to.addressLine2 + "<br>" : ""}
              ${data.to.city}, ${data.to.state}<br>
              ${data.to.phone}
            </div>
          </div>
        </div>
        <div class="footer">
          <div>
            <div class="tracking">${data.trackingNumber}</div>
            <div class="meta">${data.weight} | ${data.sizeClass}</div>
          </div>
          <img class="qr" src="${data.qrCodeUrl}" alt="QR Code" />
        </div>
        <div class="bottom-strip"></div>
        <div class="disclaimer">Kauvex Buyer Protection applies to this shipment</div>
      </div>
    </body>
    </html>
  `;
}

export interface WaybillData extends ShippingLabelData {
  declaredValue: string;
  contents: string;
  senderSignature?: string;
}

export function generateWaybillHtml(data: WaybillData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .page { width: 210mm; min-height: 297mm; padding: 15mm; }
        .header { background: #0A1628; color: white; padding: 10mm 15mm; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10mm; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: 4px; }
        .title { font-size: 18px; font-weight: 700; }
        .section { margin-bottom: 8mm; }
        .section-title { font-size: 12px; font-weight: 700; color: #0A1628; text-transform: uppercase; border-bottom: 2px solid #FF6B00; padding-bottom: 2mm; margin-bottom: 4mm; }
        .field-row { display: flex; gap: 10mm; margin-bottom: 3mm; }
        .field { flex: 1; }
        .field-label { font-size: 9px; color: #64748B; text-transform: uppercase; font-weight: 600; }
        .field-value { font-size: 12px; color: #1E293B; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin-top: 4mm; }
        th { background: #0A1628; color: white; padding: 3mm 4mm; text-align: left; font-size: 10px; font-weight: 600; }
        td { padding: 3mm 4mm; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #1E293B; }
        .total-row { font-weight: 700; }
        .signature-box { border: 1px solid #E2E8F0; padding: 5mm; min-height: 20mm; margin-top: 5mm; }
        .signature-label { font-size: 9px; color: #64748B; text-transform: uppercase; }
        .footer-bar { background: #F5F7FA; padding: 5mm 15mm; display: flex; justify-content: space-between; font-size: 10px; color: #64748B; border-top: 4px solid #FF6B00; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="logo">KAUVEX</div>
          <div style="text-align:right;">
            <div class="title">WAYBILL</div>
            <div style="font-size:12px;margin-top:2mm;">${data.trackingNumber}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Shipment Details</div>
          <div class="field-row">
            <div class="field"><div class="field-label">Service Level</div><div class="field-value">${data.serviceLevel}</div></div>
            <div class="field"><div class="field-label">Date</div><div class="field-value">${new Date().toLocaleDateString("en-NG")}</div></div>
            <div class="field"><div class="field-label">Weight</div><div class="field-value">${data.weight}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Sender</div>
          <div class="field-value">${data.from.name}</div>
          <div class="field-value" style="font-size:11px;color:#475569;">${data.from.address}, ${data.from.city}, ${data.from.state}</div>
        </div>

        <div class="section">
          <div class="section-title">Receiver</div>
          <div class="field-value" style="font-size:14px;font-weight:700;">${data.to.name}</div>
          <div class="field-value" style="font-size:12px;color:#475569;">${data.to.address}${data.to.addressLine2 ? ", " + data.to.addressLine2 : ""}, ${data.to.city}, ${data.to.state}</div>
          <div class="field-value" style="font-size:11px;color:#475569;margin-top:1mm;">Phone: ${data.to.phone}</div>
        </div>

        <div class="section">
          <div class="section-title">Contents & Value</div>
          <table>
            <tr><th>Description</th><th>Value</th></tr>
            <tr><td>${data.contents}</td><td>${data.declaredValue}</td></tr>
            <tr class="total-row"><td>Total Declared Value</td><td>${data.declaredValue}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Sender Authorization</div>
          <div class="signature-box">
            <div class="signature-label">Signature</div>
            <div style="min-height:12mm;"></div>
            <div class="signature-label">Date</div>
          </div>
        </div>

        <div class="footer-bar">
          <span>KAUVEX — ${BRAND.tagline}</span>
          <span>${data.trackingNumber}</span>
        </div>
      </div>

      <div class="page page-break">
        <div class="header" style="background:#16A34A;">
          <div class="logo">KAUVEX</div>
          <div class="title">PROOF OF DELIVERY</div>
        </div>
        <div class="section" style="margin-top:10mm;">
          <div class="section-title">Delivery Confirmation</div>
          <div class="field-row">
            <div class="field"><div class="field-label">Receiver Name</div><div class="field-value" style="min-height:8mm;border-bottom:1px solid #E2E8F0;"></div></div>
            <div class="field"><div class="field-label">Date/Time</div><div class="field-value" style="min-height:8mm;border-bottom:1px solid #E2E8F0;"></div></div>
          </div>
          <div class="field-row" style="margin-top:5mm;">
            <div class="field"><div class="field-label">Receiver Signature</div><div class="signature-box"><div style="min-height:15mm;"></div></div></div>
            <div class="field"><div class="field-label">Partner Signature</div><div class="signature-box"><div style="min-height:15mm;"></div></div></div>
          </div>
          <div class="field-row" style="margin-top:5mm;">
            <div class="field"><div class="field-label">Condition on Receipt</div><div class="field-value">☐ Good &nbsp;&nbsp; ☐ Damaged</div></div>
          </div>
        </div>
        <div class="footer-bar" style="background:#16A34A;color:white;">
          <span>Kauvex Buyer Protection applies</span>
          <span>${data.trackingNumber}</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

export interface CommercialInvoiceData {
  invoiceNumber: string;
  date: string;
  reference: string;
  shipper: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  consignee: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  items: {
    description: string;
    hsCode: string;
    quantity: number;
    unitValue: string;
    totalValue: string;
  }[];
  subtotal: string;
  shipping: string;
  insurance: string;
  totalDeclaredValue: string;
}

export function generateCommercialInvoiceHtml(data: CommercialInvoiceData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; width: 210mm; padding: 15mm; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10mm; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #0A1628; }
        .title { font-size: 20px; font-weight: 700; color: #0A1628; text-align: right; }
        .meta { font-size: 11px; color: #64748B; text-align: right; margin-top: 2mm; }
        .parties { display: flex; gap: 10mm; margin-bottom: 10mm; }
        .party-box { flex: 1; border: 1px solid #0A1628; padding: 5mm; }
        .party-label { font-size: 10px; font-weight: 700; color: #0A1628; text-transform: uppercase; margin-bottom: 2mm; }
        .party-name { font-size: 13px; font-weight: 600; color: #1E293B; }
        .party-detail { font-size: 11px; color: #475569; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8mm; }
        th { background: #0A1628; color: white; padding: 3mm 4mm; text-align: left; font-size: 10px; font-weight: 600; }
        td { padding: 3mm 4mm; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #1E293B; }
        .totals { display: flex; justify-content: flex-end; }
        .totals-table { width: 60mm; }
        .totals-row { display: flex; justify-content: space-between; padding: 2mm 4mm; font-size: 11px; }
        .totals-row.total { font-weight: 700; font-size: 13px; border-top: 2px solid #0A1628; }
        .footer { margin-top: 15mm; padding-top: 5mm; border-top: 4px solid #FF6B00; display: flex; justify-content: space-between; align-items: flex-end; }
        .footer-text { font-size: 10px; color: #64748B; font-style: italic; }
        .signature-area { width: 50mm; }
        .signature-line { border-bottom: 1px solid #1E293B; height: 15mm; margin-bottom: 2mm; }
        .signature-label { font-size: 9px; color: #64748B; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">KAUVEX</div>
          <div style="font-size:11px;color:#64748B;margin-top:2mm;">KAUVEX Global Ltd</div>
        </div>
        <div>
          <div class="title">COMMERCIAL INVOICE</div>
          <div class="meta">
            Invoice: ${data.invoiceNumber}<br>
            Date: ${data.date}<br>
            Reference: ${data.reference}
          </div>
        </div>
      </div>

      <div class="parties">
        <div class="party-box">
          <div class="party-label">Shipper / Exporter</div>
          <div class="party-name">${data.shipper.name}</div>
          <div class="party-detail">${data.shipper.address}<br>${data.shipper.city}, ${data.shipper.country}</div>
        </div>
        <div class="party-box">
          <div class="party-label">Consignee / Importer</div>
          <div class="party-name">${data.consignee.name}</div>
          <div class="party-detail">${data.consignee.address}<br>${data.consignee.city}, ${data.consignee.country}</div>
        </div>
      </div>

      <table>
        <tr>
          <th>Description</th>
          <th>HS Code</th>
          <th>Qty</th>
          <th>Unit Value</th>
          <th>Total Value</th>
        </tr>
        ${data.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td style="font-family:'JetBrains Mono',monospace;font-size:10px;">${item.hsCode}</td>
            <td>${item.quantity}</td>
            <td>${item.unitValue}</td>
            <td>${item.totalValue}</td>
          </tr>
        `).join("")}
      </table>

      <div class="totals">
        <div class="totals-table">
          <div class="totals-row"><span>Subtotal</span><span>${data.subtotal}</span></div>
          <div class="totals-row"><span>Shipping</span><span>${data.shipping}</span></div>
          <div class="totals-row"><span>Insurance</span><span>${data.insurance}</span></div>
          <div class="totals-row total"><span>Total Declared Value</span><span>${data.totalDeclaredValue}</span></div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-text">KAUVEX — ${BRAND.tagline}</div>
        <div class="signature-area">
          <div class="signature-line"></div>
          <div class="signature-label">Authorized Signature & Company Seal</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export interface PackingListData {
  packingListNumber: string;
  orderId: string;
  date: string;
  shipper: { name: string; address: string };
  consignee: { name: string; address: string };
  items: {
    description: string;
    sku: string;
    quantity: number;
    dimensions: string;
    weight: string;
  }[];
  totalPackages: number;
  totalWeight: string;
}

export function generatePackingListHtml(data: PackingListData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; width: 210mm; padding: 15mm; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10mm; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #0A1628; }
        .title { font-size: 20px; font-weight: 700; color: #0A1628; text-align: right; }
        .meta { font-size: 11px; color: #64748B; text-align: right; margin-top: 2mm; }
        .parties { display: flex; gap: 10mm; margin-bottom: 10mm; }
        .party-box { flex: 1; border-left: 3px solid #FF6B00; padding: 4mm 5mm; }
        .party-label { font-size: 10px; font-weight: 700; color: #0A1628; text-transform: uppercase; margin-bottom: 2mm; }
        .party-detail { font-size: 11px; color: #475569; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0A1628; color: white; padding: 3mm 4mm; text-align: left; font-size: 10px; font-weight: 600; }
        td { padding: 3mm 4mm; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #1E293B; }
        .summary { display: flex; gap: 15mm; margin-top: 8mm; }
        .summary-item { font-size: 11px; color: #64748B; }
        .summary-value { font-size: 13px; font-weight: 600; color: #0A1628; }
        .footer { margin-top: 15mm; padding-top: 5mm; border-top: 4px solid #FF6B00; font-size: 10px; color: #64748B; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">KAUVEX</div>
        </div>
        <div>
          <div class="title">PACKING LIST</div>
          <div class="meta">
            PL: ${data.packingListNumber}<br>
            Order: ${data.orderId}<br>
            Date: ${data.date}
          </div>
        </div>
      </div>

      <div class="parties">
        <div class="party-box">
          <div class="party-label">Shipper</div>
          <div class="party-detail">${data.shipper.name}<br>${data.shipper.address}</div>
        </div>
        <div class="party-box">
          <div class="party-label">Consignee</div>
          <div class="party-detail">${data.consignee.name}<br>${data.consignee.address}</div>
        </div>
      </div>

      <table>
        <tr>
          <th>Description</th>
          <th>SKU</th>
          <th>Qty</th>
          <th>Dimensions</th>
          <th>Weight</th>
        </tr>
        ${data.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td style="font-family:'JetBrains Mono',monospace;font-size:10px;">${item.sku}</td>
            <td>${item.quantity}</td>
            <td>${item.dimensions}</td>
            <td>${item.weight}</td>
          </tr>
        `).join("")}
      </table>

      <div class="summary">
        <div class="summary-item">Total Packages: <span class="summary-value">${data.totalPackages}</span></div>
        <div class="summary-item">Total Weight: <span class="summary-value">${data.totalWeight}</span></div>
      </div>

      <div class="footer">KAUVEX — ${BRAND.tagline}</div>
    </body>
    </html>
  `;
}

export interface FbkStorageStatementData {
  vendorName: string;
  period: string;
  items: {
    product: string;
    sku: string;
    units: number;
    days: number;
    rate: string;
    charge: string;
  }[];
  storageFees: string;
  inboundFees: string;
  otherCharges: string;
  totalDue: string;
  deductDate: string;
}

export function generateFbkStorageStatementHtml(data: FbkStorageStatementData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; width: 210mm; padding: 15mm; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10mm; }
        .logo { font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #0A1628; }
        .sub-brand { font-size: 12px; color: #059669; font-weight: 600; }
        .title { font-size: 18px; font-weight: 700; color: #0A1628; text-align: right; }
        .meta { font-size: 11px; color: #64748B; text-align: right; margin-top: 2mm; }
        .vendor-info { background: #ECFDF5; padding: 5mm; border-radius: 4px; margin-bottom: 8mm; border: 1px solid #A7F3D0; }
        .vendor-name { font-size: 14px; font-weight: 600; color: #1E293B; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8mm; }
        th { background: #0A1628; color: white; padding: 3mm 4mm; text-align: left; font-size: 10px; font-weight: 600; }
        td { padding: 3mm 4mm; border-bottom: 1px solid #E2E8F0; font-size: 11px; color: #1E293B; }
        .totals { display: flex; justify-content: flex-end; }
        .totals-table { width: 70mm; }
        .totals-row { display: flex; justify-content: space-between; padding: 2mm 4mm; font-size: 11px; }
        .totals-row.total { font-weight: 700; font-size: 13px; border-top: 2px solid #0A1628; margin-top: 2mm; }
        .deduct-note { background: #FFFBEB; padding: 4mm; border: 1px solid #FDE68A; border-radius: 4px; margin-top: 8mm; font-size: 11px; color: #92400E; }
        .footer { margin-top: 15mm; padding-top: 5mm; border-top: 4px solid #FF6B00; font-size: 10px; color: #64748B; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">KAUVEX</div>
          <div class="sub-brand">FBK Storage Statement</div>
        </div>
        <div>
          <div class="title">Storage Statement</div>
          <div class="meta">Period: ${data.period}</div>
        </div>
      </div>

      <div class="vendor-info">
        <div class="vendor-name">${data.vendorName}</div>
      </div>

      <table>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Units</th>
          <th>Days</th>
          <th>Rate</th>
          <th>Charge</th>
        </tr>
        ${data.items.map(item => `
          <tr>
            <td>${item.product}</td>
            <td style="font-family:'JetBrains Mono',monospace;font-size:10px;">${item.sku}</td>
            <td>${item.units}</td>
            <td>${item.days}</td>
            <td>${item.rate}</td>
            <td>${item.charge}</td>
          </tr>
        `).join("")}
      </table>

      <div class="totals">
        <div class="totals-table">
          <div class="totals-row"><span>Storage Fees</span><span>${data.storageFees}</span></div>
          <div class="totals-row"><span>Inbound Fees</span><span>${data.inboundFees}</span></div>
          <div class="totals-row"><span>Other Charges</span><span>${data.otherCharges}</span></div>
          <div class="totals-row total"><span>Total Due</span><span>${data.totalDue}</span></div>
        </div>
      </div>

      <div class="deduct-note">
        ⚠️ Total of <strong>${data.totalDue}</strong> will be deducted from your vendor wallet on <strong>${data.deductDate}</strong>.
      </div>

      <div class="footer">KAUVEX — ${BRAND.tagline}</div>
    </body>
    </html>
  `;
}

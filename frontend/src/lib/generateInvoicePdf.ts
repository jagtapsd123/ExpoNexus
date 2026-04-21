export interface InvoiceData {
  invoiceId: string;
  date: string;
  exhibitorName: string;
  businessName: string;
  email: string;
  exhibitionName: string;
  venue: string;
  stallNumber: string;
  stallCategory: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: number;
  subtotal: number;
  gst: number;
  total: number;
  paid: boolean;
}

export function downloadInvoicePdf(data: InvoiceData) {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${data.invoiceId}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1a1a2e; font-size: 14px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .logo { width: 48px; height: 48px; background: #F97316; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
  .title { color: #F97316; font-size: 28px; font-weight: bold; }
  .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
  .grid { display: flex; gap: 40px; margin-bottom: 32px; }
  .grid > div { flex: 1; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f3f4f6; text-align: left; padding: 10px 12px; font-size: 13px; color: #6b7280; }
  td { padding: 10px 12px; border-top: 1px solid #e5e7eb; }
  .total-row { font-weight: bold; font-size: 16px; background: #faf5f0; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
  .paid { background: #dcfce7; color: #16a34a; }
  .unpaid { background: #fef3c7; color: #d97706; }
  .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
  .text-right { text-align: right; }
  .text-sm { font-size: 13px; color: #6b7280; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <img src="${window.location.origin}/favicon.png?v=2" alt="Amrut" style="width:48px;height:48px;border-radius:8px;object-fit:contain;display:block" />
      <h2 style="margin:8px 0 2px">Amrut Stall Booking System</h2>
      <p class="text-sm">Direct Market Management</p>
    </div>
    <div class="text-right">
      <div class="title">INVOICE</div>
      <p class="text-sm">${data.invoiceId}</p>
      <p class="text-sm">${data.date}</p>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="section-title">Bill To</div>
      <p><strong>${data.exhibitorName}</strong></p>
      <p class="text-sm">${data.businessName}</p>
      <p class="text-sm">${data.email}</p>
    </div>
    <div>
      <div class="section-title">Event Details</div>
      <p><strong>${data.exhibitionName}</strong></p>
      <p class="text-sm">${data.venue}</p>
      <p class="text-sm">Stall: ${data.stallNumber} (${data.stallCategory})</p>
    </div>
  </div>

  <div style="margin-bottom:24px">
    <div class="section-title">Booking Period</div>
    <p>${data.startDate} to ${data.endDate} (${data.days} days)</p>
  </div>

  <table>
    <thead><tr><th>Description</th><th class="text-right">Amount</th></tr></thead>
    <tbody>
      <tr>
        <td>Stall Charges (${data.stallNumber} – ${data.stallCategory}) × ${data.days} days @ ₹${data.pricePerDay.toLocaleString()}/day</td>
        <td class="text-right">₹${data.subtotal.toLocaleString()}</td>
      </tr>
      <tr>
        <td class="text-sm">GST (18%)</td>
        <td class="text-right">₹${data.gst.toLocaleString()}</td>
      </tr>
      <tr class="total-row">
        <td>Grand Total</td>
        <td class="text-right">₹${data.total.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span class="badge ${data.paid ? "paid" : "unpaid"}">${data.paid ? "PAID" : "UNPAID"}</span>
    <p class="text-sm">Thank you for booking with AMRUT Peth!</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => {
      win.print();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    };
  } else {
    // Fallback: download as HTML
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.invoiceId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

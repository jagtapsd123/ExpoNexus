import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { motion } from "framer-motion";
import { downloadInvoicePdf, InvoiceData } from "@/lib/generateInvoicePdf";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/apiClient";

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface InvoiceItem {
  invoiceNumber: string;
  bookingId: number;
  exhibitorName: string;
  exhibitorEmail: string;
  businessName: string;
  exhibitionName: string;
  stallNumber: string;
  stallCategory: string;
  venue: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: number;
  subtotal: number;
  gst: number;
  total: number;
  paid: boolean;
  generatedAt: string;
}

const buildInvoiceData = (invoice: InvoiceItem): InvoiceData => ({
  invoiceId: invoice.invoiceNumber,
  date: invoice.generatedAt,
  exhibitorName: invoice.exhibitorName,
  businessName: invoice.businessName || invoice.exhibitorName,
  email: invoice.exhibitorEmail,
  exhibitionName: invoice.exhibitionName,
  venue: invoice.venue,
  stallNumber: invoice.stallNumber,
  stallCategory: invoice.stallCategory,
  startDate: invoice.startDate,
  endDate: invoice.endDate,
  days: invoice.days,
  pricePerDay: invoice.pricePerDay,
  subtotal: invoice.subtotal,
  gst: invoice.gst,
  total: invoice.total,
  paid: invoice.paid,
});

const InvoiceDetailPage = () => {
  const { bookingId } = useParams();
  const [invoice, setInvoice] = useState<InvoiceItem | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;

    let cancelled = false;

    const loadInvoice = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get<ApiResponse<InvoiceItem>>(`/invoices/booking/${bookingId}`);
        if (!cancelled) {
          setInvoice(response.data ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load invoice");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInvoice();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const pdfData = useMemo(() => (invoice ? buildInvoiceData(invoice) : null), [invoice]);

  const handleDownload = () => {
    if (!pdfData) return;
    downloadInvoicePdf(pdfData);
    toast.success("Invoice ready for download");
  };

  return (
    <motion.div {...fadeIn} className="max-w-3xl mx-auto">
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-8 print:border-none print:shadow-none" id="invoice">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading invoice...</p>
        )}

        {!isLoading && !invoice && !error && (
          <p className="text-sm text-muted-foreground">Invoice not found.</p>
        )}

        {invoice && (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mb-2">SB</div>
                <h1 className="text-xl font-bold text-foreground">StallBook</h1>
                <p className="text-xs text-muted-foreground">AMRUT Peth Direct Market</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
                <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">{new Date(invoice.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Bill To</h3>
                <p className="text-sm font-medium text-foreground">{invoice.exhibitorName}</p>
                <p className="text-sm text-muted-foreground">{invoice.businessName}</p>
                <p className="text-sm text-muted-foreground">{invoice.exhibitorEmail}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Event Details</h3>
                <p className="text-sm font-medium text-foreground">{invoice.exhibitionName}</p>
                <p className="text-sm text-muted-foreground">{invoice.venue}</p>
                <p className="text-sm text-muted-foreground">Stall: {invoice.stallNumber} ({invoice.stallCategory})</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Booking Period</h3>
              <p className="text-sm text-foreground">
                {new Date(invoice.startDate).toLocaleDateString()} to {new Date(invoice.endDate).toLocaleDateString()} ({invoice.days} days)
              </p>
            </div>

            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 text-muted-foreground font-medium">Description</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-3 text-foreground">
                      Stall Charges ({invoice.stallNumber} - {invoice.stallCategory}) x {invoice.days} days @ Rs. {invoice.pricePerDay.toLocaleString()}/day
                    </td>
                    <td className="p-3 text-right text-foreground">Rs. {invoice.subtotal.toLocaleString()}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-3 text-muted-foreground">GST (18%)</td>
                    <td className="p-3 text-right text-foreground">Rs. {invoice.gst.toLocaleString()}</td>
                  </tr>
                  <tr className="border-t-2 border-border bg-muted/50">
                    <td className="p-3 font-bold text-foreground">Grand Total</td>
                    <td className="p-3 text-right font-bold text-foreground text-base">Rs. {invoice.total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded text-xs font-medium ${invoice.paid ? "bg-stall-general-bg text-stall-general" : "bg-yellow-100 text-yellow-700"}`}>
                {invoice.paid ? "PAID" : "UNPAID"}
              </span>
              <p className="text-sm text-muted-foreground">Thank you for booking with AMRUT Peth!</p>
            </div>
          </>
        )}
      </div>

      {invoice && (
        <div className="flex justify-center gap-3 mt-6 print:hidden">
          <Button onClick={() => window.print()}>
            <Printer size={16} className="mr-2" /> Print Invoice
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download size={16} className="mr-2" /> Download PDF
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default InvoiceDetailPage;

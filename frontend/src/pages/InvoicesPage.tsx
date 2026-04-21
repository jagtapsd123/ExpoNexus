import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { api, ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { downloadInvoicePdf, InvoiceData } from "@/lib/generateInvoicePdf";
import { useNavigate } from "react-router-dom";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
}

interface InvoiceItem {
  id: number;
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

const InvoicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadInvoices = async () => {
      setIsLoading(true);
      setError("");
      try {
        const endpoint = user.role === "exhibitor"
          ? "/invoices/my?page=0&size=100&sort=generatedAt,desc"
          : "/invoices?page=0&size=100&sort=generatedAt,desc";
        const response = await api.get<ApiResponse<PageResponse<InvoiceItem>>>(endpoint);
        if (!cancelled) {
          setInvoices(response.data?.content ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load invoices");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInvoices();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDownload = (invoice: InvoiceItem) => {
    downloadInvoicePdf(buildInvoiceData(invoice));
    toast.success(`Invoice ${invoice.invoiceNumber} ready for download`);
  };

  return (
    <div>
      <PageHeader title="Invoices" description="View and download generated invoices" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Invoice ID</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Exhibitor</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Exhibition</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Amount</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">No invoices found.</td>
                </tr>
              )}
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="p-3 text-foreground font-mono text-xs">{invoice.invoiceNumber}</td>
                  <td className="p-3 text-foreground">{invoice.exhibitorName}</td>
                  <td className="p-3 text-foreground">{invoice.exhibitionName}</td>
                  <td className="p-3"><span className="px-2 py-1 rounded text-xs font-medium surface-peach text-foreground">{invoice.stallCategory}</span></td>
                  <td className="p-3 text-right text-foreground font-medium">Rs. {invoice.total.toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground">{new Date(invoice.generatedAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/invoice/${invoice.bookingId}`)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(invoice)}>
                        <Download size={14} className="mr-1" /> PDF
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;

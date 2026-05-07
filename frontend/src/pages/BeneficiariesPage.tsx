import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { config } from "@/config/env";
import { Search, Upload, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Beneficiary {
  id: number;
  name: string;
  mobile?: string;
  address?: string;
  category?: string;
  businessName?: string;
  businessType?: string;
  beneficiaryCode?: string;
  stallNumber?: string;
  exhibitionDate?: string;
  totalTurnover?: number | string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const PAGE_SIZE = 10;

const getPageWindow = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "…")[] = [];
  if (current <= 3) {
    pages.push(0, 1, 2, 3, 4, "…", total - 1);
  } else if (current >= total - 4) {
    pages.push(0, "…", total - 5, total - 4, total - 3, total - 2, total - 1);
  } else {
    pages.push(0, "…", current - 1, current, current + 1, "…", total - 1);
  }
  return pages;
};

const BeneficiariesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage]                   = useState(0);
  const [search, setSearch]               = useState("");
  const [searchInput, setSearchInput]     = useState("");
  const [isLoading, setIsLoading]         = useState(true);
  const [isImporting, setIsImporting]     = useState(false);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          size: String(PAGE_SIZE),
          sort: "id,asc",
        });
        if (search) params.set("search", search);
        const res = await api.get<ApiResponse<PageResponse<Beneficiary>>>(
          `/beneficiaries?${params}`
        );
        if (!cancelled && res.data) {
          setBeneficiaries(res.data.content);
          setTotalPages(res.data.totalPages);
          setTotalElements(res.data.totalElements);
        }
      } catch (err) {
        if (!cancelled) toast.error(err instanceof ApiError ? err.message : "Failed to load beneficiaries");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [page, search]);

  const handleSearch = () => {
    setPage(0);
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(0);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("amrut_auth_token");
      const response = await fetch(`${config.apiBaseUrl}/beneficiaries/import`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      const payload = await response.json().catch(() => null) as ApiResponse<{
        imported: number; skipped: number; totalRows: number; errors: string[];
      }> | null;
      if (!response.ok) {
        if ((response.status === 401 || response.status === 403) && token) {
          window.dispatchEvent(new CustomEvent("auth:session-expired"));
          return;
        }
        throw new ApiError(payload?.message ?? "Import failed", response.status, payload);
      }
      const d = payload?.data;
      if (d) {
        toast.success(`Imported ${d.imported} of ${d.totalRows} rows${d.skipped ? ` (${d.skipped} skipped)` : ""}`);
        d.errors?.slice(0, 5).forEach((msg) => toast.warning(msg));
      }
      setPage(0);
      setSearch("");
      setSearchInput("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const pageWindow = getPageWindow(page, totalPages);
  const from = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const to   = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div>
      <PageHeader
        title="Beneficiaries"
        description="Scheme beneficiaries registered under AMRUT Peth"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex flex-1 min-w-[200px] max-w-sm gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, mobile, category…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>Search</Button>
          {search && (
            <Button variant="ghost" size="sm" onClick={clearSearch} className="px-2 text-muted-foreground">
              Clear
            </Button>
          )}
        </div>

        {isAdmin && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="gap-2"
            >
              {isImporting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {isImporting ? "Importing…" : "Import Excel"}
            </Button>
          </>
        )}
      </div>

      {isAdmin && (
        <p className="text-xs text-muted-foreground mb-3">
          Excel columns (row 1 = header):&nbsp;
          <span className="font-medium">Address | Stall Number | Name* | Exhibition Date | Total Turnover | Category/Business Type | Beneficiary Code</span>
        </p>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-3 text-muted-foreground font-semibold w-10">#</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Code</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Name</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Stall No.</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Exhibition Date</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Turnover</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Category</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Business</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Address</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-muted-foreground">
                    <Loader2 size={20} className="animate-spin inline-block mr-2" />Loading…
                  </td>
                </tr>
              )}
              {!isLoading && beneficiaries.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-muted-foreground">
                    {search ? `No beneficiaries match "${search}".` : "No beneficiaries imported yet."}
                  </td>
                </tr>
              )}
              {!isLoading && beneficiaries.map((b, idx) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                  <td className="p-3 text-xs text-muted-foreground">{from + idx}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{b.beneficiaryCode ?? "—"}</td>
                  <td className="p-3 font-medium text-foreground">{b.name}</td>
                  <td className="p-3 text-muted-foreground">{b.stallNumber || "-"}</td>
                  <td className="p-3 text-muted-foreground">{b.exhibitionDate || "-"}</td>
                  <td className="p-3 text-muted-foreground">{b.totalTurnover ?? "—"}</td>
                  <td className="p-3">
                    {b.category
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">{b.category}</span>
                      : "—"}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {b.businessName && <span className="block font-medium text-foreground">{b.businessName}</span>}
                    {b.businessType && <span className="block">{b.businessType}</span>}
                    {!b.businessName && !b.businessType && "—"}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground max-w-[180px] truncate" title={b.address}>{b.address ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer — always visible when data exists */}
        {totalElements > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing {from}–{to} of {totalElements} beneficiar{totalElements === 1 ? "y" : "ies"}
            </span>

            <div className="flex items-center gap-1">
              {/* Prev */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0 || isLoading}
                className="h-8 w-8 p-0"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </Button>

              {/* Page numbers */}
              {pageWindow.map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground select-none">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {(p as number) + 1}
                  </Button>
                )
              )}

              {/* Next */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1 || isLoading}
                className="h-8 w-8 p-0"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiariesPage;

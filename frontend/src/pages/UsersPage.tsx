import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/apiClient";
import { Search } from "lucide-react";

type UserStatus = "pending" | "approved" | "rejected";
type UserRole   = "all" | "admin" | "organizer" | "exhibitor";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PageResponse<T> {
  content: T[];
}

interface UserItem {
  id: number;
  memberId?: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  mobile?: string;
  businessName?: string;
  designation?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    approved: "bg-green-50 text-green-700 border-green-200",
    pending:  "bg-yellow-50 text-yellow-700 border-yellow-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    admin:     "bg-purple-50 text-purple-700 border-purple-200",
    organizer: "bg-blue-50 text-blue-700 border-blue-200",
    exhibitor: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[role] ?? "bg-muted text-muted-foreground border-border"}`}>
      {role}
    </span>
  );
};

const UsersPage = () => {
  const [users, setUsers]         = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter]     = useState<UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get<ApiResponse<PageResponse<UserItem>>>(
          "/users?page=0&size=200&sort=createdAt,desc"
        );
        if (!cancelled) setUsers(response.data?.content ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load users");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadUsers();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesRole   = roleFilter   === "all" || u.role   === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      const matchesSearch = !q
        || u.name.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || (u.memberId ?? "").toLowerCase().includes(q)
        || (u.businessName ?? "").toLowerCase().includes(q);
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleStatusChange = async (userId: number, status: UserStatus) => {
    try {
      const response = await api.patch<ApiResponse<UserItem>>(
        `/users/${userId}/status?status=${status.toUpperCase()}`
      );
      if (response.data) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? response.data! : u)));
      }
      toast.success(`User status updated to ${status}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update user status");
    }
  };

  return (
    <div>
      <PageHeader title="Users" description="Manage system users, roles, and approval status" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or Member ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="organizer">Organizer</SelectItem>
            <SelectItem value="exhibitor">Exhibitor</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | UserStatus)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {(search || roleFilter !== "all" || statusFilter !== "all") && (
          <span className="self-center text-xs text-muted-foreground">
            {filtered.length} of {users.length} users
          </span>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-3 text-muted-foreground font-semibold">Member ID</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Name</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Email</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Role</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Status</th>
                <th className="text-left p-3 text-muted-foreground font-semibold">Business</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                  <td className="p-3 font-mono text-xs text-muted-foreground">{user.memberId ?? "—"}</td>
                  <td className="p-3 font-medium text-foreground">{user.name}</td>
                  <td className="p-3 text-muted-foreground">{user.email}</td>
                  <td className="p-3"><RoleBadge role={user.role} /></td>
                  <td className="p-3">
                    {user.role === "admin" ? (
                      <StatusBadge status="approved" />
                    ) : (
                      <Select
                        value={user.status}
                        onValueChange={(value) => void handleStatusChange(user.id, value as UserStatus)}
                      >
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {user.businessName && <span className="block">{user.businessName}</span>}
                    {user.mobile && <span className="block">{user.mobile}</span>}
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

export default UsersPage;

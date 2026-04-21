import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/apiClient";

type UserStatus = "pending" | "approved" | "rejected";

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
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  mobile?: string;
  businessName?: string;
  designation?: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get<ApiResponse<PageResponse<UserItem>>>("/users?page=0&size=100&sort=createdAt,desc");
        if (!cancelled) {
          setUsers(response.data?.content ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load users");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleStatusChange = async (userId: number, status: UserStatus) => {
    try {
      const response = await api.patch<ApiResponse<UserItem>>(`/users/${userId}/status?status=${status.toUpperCase()}`);
      if (response.data) {
        setUsers((prev) => prev.map((user) => (user.id === userId ? response.data! : user)));
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

      <div className="bg-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Role</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="p-3 text-foreground">{user.name}</td>
                  <td className="p-3 text-muted-foreground">{user.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs font-medium surface-peach text-foreground capitalize">{user.role}</span>
                  </td>
                  <td className="p-3">
                    {user.role === "admin" ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-stall-general-bg text-stall-general">approved</span>
                    ) : (
                      <Select value={user.status} onValueChange={(value) => void handleStatusChange(user.id, value as UserStatus)}>
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
                    {user.businessName && <span>Business: {user.businessName}</span>}
                    {user.designation && <span>Designation: {user.designation}</span>}
                    {user.mobile && <span className="ml-2">Mobile: {user.mobile}</span>}
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

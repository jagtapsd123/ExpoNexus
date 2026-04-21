import { useAuth, UserRole } from "@/contexts/AuthContext";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Ticket, FileText, Settings, Users, Package,
  MessageSquare, ClipboardList, LogOut, ChevronLeft, ChevronRight, History, Image, SlidersHorizontal, Map
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logoIcon from "@/assets/amrut-logo.png";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "organizer", "exhibitor"] },
  { label: "Exhibitions", path: "/exhibitions", icon: Calendar, roles: ["admin", "organizer"] },
  { label: "Past Exhibitions", path: "/previous-exhibitions", icon: History, roles: ["admin", "organizer", "exhibitor"] },
  { label: "Bookings", path: "/bookings", icon: Ticket, roles: ["admin", "exhibitor"] },
  { label: "Stall Booking", path: "/stall-booking", icon: Ticket, roles: ["exhibitor"] },
  { label: "Book Stall", path: "/book-stall", icon: Ticket, roles: ["exhibitor"] },
  { label: "My Bookings", path: "/my-bookings", icon: ClipboardList, roles: ["exhibitor"] },
  { label: "Stall Management", path: "/stall-management", icon: Package, roles: ["admin", "organizer"] },
  { label: "Stall Layout Management", path: "/stall-layout", icon: Map, roles: ["admin"] },
  { label: "Invoices", path: "/invoices", icon: FileText, roles: ["admin"] },
  { label: "Facilities", path: "/facilities", icon: Package, roles: ["admin", "organizer", "exhibitor"] },
  { label: "Complaints", path: "/complaints", icon: MessageSquare, roles: ["admin", "organizer", "exhibitor"] },
  { label: "Users", path: "/users", icon: Users, roles: ["admin"] },
  { label: "Landing Gallery", path: "/landing-gallery", icon: Image, roles: ["admin"] },
  { label: "Landing Settings", path: "/landing-settings", icon: SlidersHorizontal, roles: ["admin"] },
];

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className={cn(
      "h-screen bg-card border-r border-border flex flex-col transition-all duration-200",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img src={logoIcon} alt="Amrut" className="w-12 h-12 rounded-lg object-contain shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground leading-tight truncate">Amrut Stall</h1>
              <p className="text-xs text-muted-foreground truncate">Booking System</p>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-accent text-muted-foreground shrink-0">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        {!collapsed && (
          <div className="mb-2">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full"
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

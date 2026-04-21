import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { NotificationDropdown } from "../NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, Settings, LogOut } from "lucide-react";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-end px-4 gap-2 shrink-0">
          <NotificationDropdown />
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                {initials}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end">
              <button onClick={() => navigate("/profile")} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors">
                <Settings size={14} /> Profile Settings
              </button>
              <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent rounded-md transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </PopoverContent>
          </Popover>
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

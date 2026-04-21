import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string; message: string; time: string; type: "payment" | "booking" | "registration"; read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "n1", message: "Payment of ₹15,000 received from Green Farms Ltd", time: "5 min ago", type: "payment", read: false },
  { id: "n2", message: "New stall booking for AMRUT Peth Kisan Mela 2025", time: "1 hour ago", type: "booking", read: false },
  { id: "n3", message: "New exhibitor registration: Organic Seeds Co", time: "3 hours ago", type: "registration", read: false },
  { id: "n4", message: "Payment of ₹7,000 received from AgriTech Solutions", time: "Yesterday", type: "payment", read: true },
  { id: "n5", message: "Stall S010 booked for Agri Trade Fair 2025", time: "2 days ago", type: "booking", read: true },
];

const dotColor: Record<string, string> = {
  payment: "bg-stall-general",
  booking: "bg-blue-500",
  registration: "bg-amber-500",
};

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-md hover:bg-accent transition-colors">
          <Bell size={20} className="text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Check size={12} /> Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {notifications.map(n => (
            <div key={n.id} className={`flex gap-3 p-3 border-b border-border last:border-0 ${!n.read ? "bg-accent/30" : ""}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor[n.type]}`} style={{ backgroundColor: dotColor[n.type] ? undefined : undefined }} />
              <div className="min-w-0">
                <p className="text-sm text-foreground leading-snug">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="p-2 border-t border-border text-center">
          <button className="text-xs text-primary hover:underline">View all</button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

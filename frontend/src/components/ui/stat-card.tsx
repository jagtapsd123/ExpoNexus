import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: "default" | "peach";
}

export const StatCard = ({ title, value, subtitle, icon, variant = "default" }: StatCardProps) => (
  <div className={cn(
    "rounded-lg border border-border p-5 transition-shadow hover:shadow-md",
    variant === "peach" ? "surface-peach" : "bg-card"
  )}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {icon && <div className="text-primary">{icon}</div>}
    </div>
  </div>
);

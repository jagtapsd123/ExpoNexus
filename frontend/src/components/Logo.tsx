import logoIcon from "@/assets/amrut-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
  className?: string;
  text?: string;
}

export const Logo = ({
  size = 36,
  showText = true,
  textClassName,
  className,
  text = "Amrut Stall Booking System",
}: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={logoIcon}
        alt="Amrut Stall Booking System"
        width={size}
        height={size}
        className="rounded-lg object-contain shrink-0"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className={cn("font-bold text-foreground truncate", textClassName)}>
          {text}
        </span>
      )}
    </div>
  );
};

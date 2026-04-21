import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

import { useState } from "react";
import { useAuth, RegisterData } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

type RoleTab = "exhibitor" | "organizer";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<RoleTab>("exhibitor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", password: "", address: "",
    businessName: "", businessType: "", designation: "",
  });
  const [error, setError] = useState("");

  const set = (key: string, val: string) => setForm({ ...form, [key]: val });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.mobile || !form.password || !form.address) {
      setError("All required fields must be filled");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (tab === "exhibitor" && !form.businessName) {
      setError("Business / Shop Name is required for exhibitors");
      return;
    }

    const data: RegisterData = {
      name: form.name, email: form.email, mobile: form.mobile,
      password: form.password, address: form.address, role: tab,
      businessName: tab === "exhibitor" ? form.businessName : undefined,
      businessType: tab === "exhibitor" ? form.businessType : undefined,
      designation: tab === "organizer" ? form.designation : undefined,
    };

    setIsSubmitting(true);
    const result = await register(data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Registration submitted! Please wait for admin approval.");
      navigate("/login");
    } else {
      setError(result.reason || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">AMRUT</h1>
          <p className="text-lg text-primary-foreground/80">Peth Direct Market Management</p>
          <p className="text-sm text-primary-foreground/60 mt-2">Self Registration</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
            <p className="text-sm text-muted-foreground mt-1">Register as an Exhibitor or Organizer</p>
          </div>

          {/* Role tabs */}
          <div className="flex rounded-lg border border-border mb-6 overflow-hidden">
            {(["exhibitor", "organizer"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTab(r)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  tab === r ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                {r === "exhibitor" ? "Exhibitor" : "Organizer"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
            <div><Label>Mobile Number *</Label><Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} required /></div>
            <div><Label>Password *</Label><PasswordInput value={form.password} onChange={(e) => set("password", e.target.value)} required /></div>
            <div><Label>Address *</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} required /></div>

            {tab === "exhibitor" && (
              <>
                <div><Label>Business / Shop Name *</Label><Input value={form.businessName} onChange={(e) => set("businessName", e.target.value)} /></div>
                <div><Label>Business Type</Label><Input value={form.businessType} onChange={(e) => set("businessType", e.target.value)} placeholder="e.g. Agriculture, Seeds, Equipment" /></div>
              </>
            )}

            {tab === "organizer" && (
              <div><Label>Designation</Label><Input value={form.designation} onChange={(e) => set("designation", e.target.value)} placeholder="e.g. Event Manager" /></div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>

          <div className="mt-6 p-3 rounded-lg surface-peach">
            <p className="text-xs text-muted-foreground">
              ⚠️ After registration, your account will be reviewed by an admin before you can log in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

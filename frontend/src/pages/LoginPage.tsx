import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { LoginSlideshow } from "@/components/LoginSlideshow";
import { useLandingGallery } from "@/hooks/useLandingGallery";
import { Logo } from "@/components/Logo";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { images: landingImages } = useLandingGallery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.reason || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2">
        <LoginSlideshow images={landingImages.length > 0 ? landingImages : undefined} />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <Logo size={64} textClassName="text-lg" className="mb-6" />
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@amrut.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
          </p>

          <div className="mt-8 p-4 rounded-lg surface-peach">
            <p className="text-xs font-medium text-foreground mb-2">Demo Accounts</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Admin:</strong> admin@amrut.com / admin123</p>
              <p><strong>Organizer:</strong> organizer@amrut.com / org123</p>
              <p><strong>Exhibitor:</strong> exhibitor@amrut.com / ex123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

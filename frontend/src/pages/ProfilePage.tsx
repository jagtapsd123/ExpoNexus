import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Camera } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  if (!user) return null;

  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSave = () => {
    toast.success("Profile updated successfully");
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Please fill all password fields");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    toast.success("Password changed successfully");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div>
      <PageHeader title="Profile Settings" description="Manage your account details" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn}>
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-center">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {initials}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-background" />
                  </div>
                </div>
              </div>
              <div>
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user.email} readOnly className="bg-muted" />
              </div>
              <div>
                <Label>Role</Label>
                <Input value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} readOnly className="bg-muted" />
              </div>
              <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card>
              <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <PasswordInput value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                </div>
                <div>
                  <Label>New Password</Label>
                  <PasswordInput value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <PasswordInput value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
                <Button onClick={handlePasswordChange} className="w-full">Update Password</Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.2 }}>
            <Button variant="destructive" onClick={logout} className="w-full">
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

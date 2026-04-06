import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, CheckCircle2, Loader2, User } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  emergency_contact: string | null;
  medical_history: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
}

const FIELDS: { key: keyof ProfileData; label: string }[] = [
  { key: "full_name", label: "Full Name" },
  { key: "avatar_url", label: "Profile Photo" },
  { key: "date_of_birth", label: "Date of Birth" },
  { key: "gender", label: "Gender" },
  { key: "address", label: "Address" },
  { key: "emergency_contact", label: "Emergency Contact" },
  { key: "medical_history", label: "Medical History" },
  { key: "allergies", label: "Allergies & Chronic Conditions" },
];

const DashboardProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, avatar_url, date_of_birth, gender, address, emergency_contact, medical_history, allergies, chronic_conditions")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as ProfileData ?? {
          full_name: null, phone: null, avatar_url: null, date_of_birth: null,
          gender: null, address: null, emergency_contact: null,
          medical_history: null, allergies: null, chronic_conditions: null,
        });
        setLoading(false);
      });
  }, [user]);

  const completionPercent = profile ? Math.round(
    (FIELDS.filter(f => {
      const val = profile[f.key];
      return val && val.trim() !== "";
    }).length / FIELDS.length) * 100
  ) : 0;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("provider-documents").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("provider-documents").getPublicUrl(path);
    const avatar_url = urlData.publicUrl;
    await supabase.from("profiles").update({ avatar_url }).eq("user_id", user.id);
    setProfile(prev => prev ? { ...prev, avatar_url } : prev);
    setUploading(false);
    toast.success("Photo updated!");
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      date_of_birth: profile.date_of_birth || null,
      gender: profile.gender || null,
      address: profile.address || null,
      emergency_contact: profile.emergency_contact || null,
      medical_history: profile.medical_history || null,
      allergies: profile.allergies || null,
      chronic_conditions: profile.chronic_conditions || null,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Save failed: " + error.message);
    } else {
      toast.success("Profile saved!");
      setEditing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      {completionPercent < 100 && (
        <div className="rounded-xl bg-accent/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Complete your profile</p>
            <span className="text-sm font-bold text-primary">{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Fill in all fields to help healthcare providers serve you better
          </p>
        </div>
      )}

      {completionPercent === 100 && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Profile complete!</span>
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-accent">
              <User className="h-8 w-8 text-accent-foreground" />
            </AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">{profile.full_name || "Your Name"}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* Form */}
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profile.full_name ?? ""}
                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={profile.date_of_birth ?? ""}
                onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={profile.gender ?? ""} onValueChange={v => setProfile({ ...profile, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input
                value={profile.emergency_contact ?? ""}
                onChange={e => setProfile({ ...profile, emergency_contact: e.target.value })}
                placeholder="Phone number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={profile.address ?? ""}
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              placeholder="Your full address"
            />
          </div>
          <div className="space-y-2">
            <Label>Medical History</Label>
            <Textarea
              value={profile.medical_history ?? ""}
              onChange={e => setProfile({ ...profile, medical_history: e.target.value })}
              placeholder="Past surgeries, conditions, etc."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Allergies & Chronic Conditions</Label>
            <Textarea
              value={profile.allergies ?? ""}
              onChange={e => setProfile({ ...profile, allergies: e.target.value })}
              placeholder="List any allergies or chronic conditions"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save Profile
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Date of Birth", value: profile.date_of_birth },
            { label: "Gender", value: profile.gender },
            { label: "Address", value: profile.address },
            { label: "Emergency Contact", value: profile.emergency_contact },
            { label: "Medical History", value: profile.medical_history },
            { label: "Allergies", value: profile.allergies },
          ].map(item => (
            <div key={item.label} className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {item.value || <span className="text-muted-foreground italic">Not set</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardProfile;

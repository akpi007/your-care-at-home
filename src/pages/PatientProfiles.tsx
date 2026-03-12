import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, User, Heart, Droplets, Pill, Phone, AlertTriangle } from "lucide-react";

interface PatientProfile {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  allergies: string | null;
  medical_history: string | null;
  medications: string | null;
  emergency_contact: string | null;
}

const emptyProfile: Omit<PatientProfile, "id"> = {
  name: "",
  age: null,
  gender: null,
  blood_group: null,
  allergies: null,
  medical_history: null,
  medications: null,
  emergency_contact: null,
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Male", "Female", "Other"];

const PatientProfiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PatientProfile | null>(null);
  const [form, setForm] = useState(emptyProfile);

  const fetchProfiles = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("patient_profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error loading profiles", description: error.message, variant: "destructive" });
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const openCreate = () => {
    setEditingProfile(null);
    setForm(emptyProfile);
    setDialogOpen(true);
  };

  const openEdit = (profile: PatientProfile) => {
    setEditingProfile(profile);
    setForm({
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      blood_group: profile.blood_group,
      allergies: profile.allergies,
      medical_history: profile.medical_history,
      medications: profile.medications,
      emergency_contact: profile.emergency_contact,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    if (editingProfile) {
      const { error } = await supabase
        .from("patient_profiles")
        .update({ ...form, user_id: user!.id })
        .eq("id", editingProfile.id);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Profile updated" });
    } else {
      const { error } = await supabase
        .from("patient_profiles")
        .insert({ ...form, user_id: user!.id });
      if (error) {
        toast({ title: "Creation failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Profile created" });
    }

    setDialogOpen(false);
    fetchProfiles();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("patient_profiles").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile deleted" });
      fetchProfiles();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="container py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Patient Profiles</h1>
            <p className="mt-1 text-muted-foreground">
              Manage profiles for yourself and family members
            </p>
          </div>
          <Button variant="hero" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Add Profile
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-card shadow-card">
            <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No profiles yet</h3>
            <p className="mt-1 text-muted-foreground">Add a patient profile to get started with booking</p>
            <Button variant="hero" className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" /> Add First Profile
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-2xl bg-card p-6 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                      <User className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-card-foreground">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.age ? `${profile.age} yrs` : ""}
                        {profile.age && profile.gender ? " • " : ""}
                        {profile.gender || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(profile)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(profile.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {profile.blood_group && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Droplets className="h-3.5 w-3.5 text-destructive" />
                      <span>Blood: {profile.blood_group}</span>
                    </div>
                  )}
                  {profile.allergies && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="truncate">Allergies: {profile.allergies}</span>
                    </div>
                  )}
                  {profile.medications && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Pill className="h-3.5 w-3.5 text-primary" />
                      <span className="truncate">Meds: {profile.medications}</span>
                    </div>
                  )}
                  {profile.emergency_contact && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-healthcare-green" />
                      <span>{profile.emergency_contact}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProfile ? "Edit Profile" : "Add Patient Profile"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Patient name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={form.age ?? ""}
                  onChange={(e) => setForm({ ...form, age: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender || ""} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {genders.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select value={form.blood_group || ""} onValueChange={(v) => setForm({ ...form, blood_group: v })}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Allergies</Label>
              <Textarea
                value={form.allergies || ""}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="List any known allergies"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Medical History</Label>
              <Textarea
                value={form.medical_history || ""}
                onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
                placeholder="Past surgeries, conditions, etc."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Medications</Label>
              <Textarea
                value={form.medications || ""}
                onChange={(e) => setForm({ ...form, medications: e.target.value })}
                placeholder="List current medications"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input
                value={form.emergency_contact || ""}
                onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                placeholder="Phone number"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleSave}>
                {editingProfile ? "Save Changes" : "Add Profile"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PatientProfiles;

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Upload, Loader2, Camera, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { ProviderProfile } from "@/hooks/useProviderData";

interface Props {
  profile: ProviderProfile;
}

const MAX_BIO = 500;
const MAX_FEE = 10000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const ProviderProfileEdit = ({ profile }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [bio, setBio] = useState(profile.bio);
  const [fee, setFee] = useState(String(profile.consultationFee));
  const [saving, setSaving] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idFileName, setIdFileName] = useState<string | null>(null);

  const photoRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return "Only JPG, PNG, WEBP, or PDF files allowed.";
    if (file.size > MAX_FILE_SIZE) return "File must be under 5MB.";
    return null;
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { toast({ title: "Invalid file", description: err, variant: "destructive" }); return; }
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", description: "Passport photo must be an image.", variant: "destructive" }); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleIdSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { toast({ title: "Invalid file", description: err, variant: "destructive" }); return; }
    setIdFile(file);
    setIdFileName(file.name);
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("provider-documents")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("provider-documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    const feeNum = parseFloat(fee);
    if (isNaN(feeNum) || feeNum < 0 || feeNum > MAX_FEE) {
      toast({ title: "Invalid fee", description: `Fee must be between 0 and ${MAX_FEE}.`, variant: "destructive" });
      return;
    }
    if (bio.length > MAX_BIO) {
      toast({ title: "Bio too long", description: `Bio must be under ${MAX_BIO} characters.`, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const updates: Record<string, any> = {
        bio: bio.trim(),
        consultation_fee: feeNum,
      };

      if (photoFile) {
        updates.passport_photo_url = await uploadFile(photoFile, "photo");
        updates.image_url = updates.passport_photo_url; // also set as display image
      }
      if (idFile) {
        updates.id_proof_url = await uploadFile(idFile, "id-proof");
      }

      const { error } = await supabase
        .from("professionals")
        .update(updates)
        .eq("id", profile.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["provider-profile"] });
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({ title: "Profile updated!" });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v) {
        setBio(profile.bio);
        setFee(String(profile.consultationFee));
        setPhotoFile(null);
        setPhotoPreview(null);
        setIdFile(null);
        setIdFileName(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-1" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Provider Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Passport Photo (required) */}
          <div className="space-y-2">
            <Label>Passport Photograph <span className="text-destructive">*</span></Label>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
            <div
              onClick={() => photoRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors p-4 flex flex-col items-center gap-2"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-24 w-24 rounded-xl object-cover" />
              ) : (
                <Camera className="h-10 w-10 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {photoFile ? photoFile.name : "Click to upload passport photo"}
              </span>
            </div>
          </div>

          {/* ID Proof / Licence */}
          <div className="space-y-2">
            <Label>ID Proof / Licence</Label>
            <input ref={idRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleIdSelect} />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => idRef.current?.click()}
            >
              {idFileName ? (
                <><FileCheck className="h-4 w-4 mr-2 text-primary" />{idFileName}</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Upload ID Proof / Licence</>
              )}
            </Button>
          </div>

          {/* Consultation Fee */}
          <div className="space-y-2">
            <Label htmlFor="edit-fee">Consultation Fee ($)</Label>
            <Input
              id="edit-fee"
              type="number"
              min={0}
              max={MAX_FEE}
              step={0.01}
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={MAX_BIO}
              placeholder="Tell patients about your experience..."
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/{MAX_BIO}</p>
          </div>

          <Button onClick={handleSave} className="w-full" variant="hero" disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderProfileEdit;

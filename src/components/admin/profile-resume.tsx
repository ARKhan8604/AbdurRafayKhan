"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { ImageUploader } from "@/components/admin/image-uploader";
import { updateProfileImage, updateResume } from "@/server/actions";

export function ProfileResumeManager({
  profileImageUrl,
  resumeUrl,
}: {
  profileImageUrl: string | null;
  resumeUrl: string | null;
}) {
  const [, start] = useTransition();
  const [profile, setProfile] = useState(profileImageUrl);
  const [resume, setResume] = useState(resumeUrl);

  function saveProfile(url: string | null) {
    setProfile(url);
    start(async () => {
      try {
        await updateProfileImage(url);
        toast.success(url ? "Profile photo updated" : "Profile photo removed");
      } catch {
        toast.error("Couldn't save");
      }
    });
  }

  function saveResume(url: string | null) {
    setResume(url);
    start(async () => {
      try {
        await updateResume(url);
        toast.success(url ? "Résumé updated" : "Résumé removed");
      } catch {
        toast.error("Couldn't save");
      }
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <Field label="Profile photo" hint="Square image works best. Stored on Cloudinary.">
          <ImageUploader value={profile} onChange={saveProfile} folder="profile" kind="image" label="Upload photo" />
        </Field>
      </Card>
      <Card className="p-6">
        <Field label="Résumé" hint="PDF or image. A download button appears across the site.">
          <ImageUploader value={resume} onChange={saveResume} folder="resume" kind="file" label="Upload résumé" />
        </Field>
      </Card>
    </div>
  );
}

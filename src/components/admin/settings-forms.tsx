"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateSettings, type SettingsInput } from "@/server/actions";

type Settings = {
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string | null;
  roles: string[];
  aboutHeading: string | null;
  aboutBody: string | null;
  location: string | null;
  email: string | null;
  availableForWork: boolean;
} | null;

function useSave() {
  const [pending, start] = useTransition();
  const save = (input: SettingsInput) =>
    start(async () => {
      try {
        await updateSettings(input);
        toast.success("Saved");
      } catch {
        toast.error("Couldn't save — check your database connection");
      }
    });
  return { pending, save };
}

export function HeroForm({ settings }: { settings: Settings }) {
  const { pending, save } = useSave();
  const [heroTitle, setHeroTitle] = useState(settings?.heroTitle ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(settings?.heroSubtitle ?? "");
  const [heroTagline, setHeroTagline] = useState(settings?.heroTagline ?? "");
  const [roles, setRoles] = useState((settings?.roles ?? []).join(", "));
  const [location, setLocation] = useState(settings?.location ?? "");
  const [email, setEmail] = useState(settings?.email ?? "");
  const [available, setAvailable] = useState(settings?.availableForWork ?? true);

  return (
    <Card className="flex flex-col gap-5 p-6">
      <Field label="Name / Hero title">
        <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
      </Field>
      <Field label="Subtitle" hint="Shown under your name. Separate roles with • bullets.">
        <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
      </Field>
      <Field label="Tagline" hint="One-line description in the hero.">
        <Textarea value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)} />
      </Field>
      <Field label="Roles" hint="Comma-separated, used for structured data.">
        <Input value={roles} onChange={(e) => setRoles(e.target.value)} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Location">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </Field>
      </div>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        <span className="text-sm">Show &quot;available for work&quot; badge</span>
      </label>
      <div>
        <Button
          disabled={pending}
          onClick={() =>
            save({
              heroTitle,
              heroSubtitle,
              heroTagline,
              roles: roles.split(",").map((r) => r.trim()).filter(Boolean),
              location,
              email,
              availableForWork: available,
            })
          }
        >
          {pending ? "Saving…" : "Save hero"}
        </Button>
      </div>
    </Card>
  );
}

export function AboutForm({ settings }: { settings: Settings }) {
  const { pending, save } = useSave();
  const [aboutHeading, setHeading] = useState(settings?.aboutHeading ?? "");
  const [aboutBody, setBody] = useState(settings?.aboutBody ?? "");

  return (
    <Card className="flex flex-col gap-5 p-6">
      <Field label="About heading">
        <Input value={aboutHeading} onChange={(e) => setHeading(e.target.value)} />
      </Field>
      <Field label="About body" hint="Separate paragraphs with a blank line.">
        <Textarea
          value={aboutBody}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-48"
        />
      </Field>
      <div>
        <Button disabled={pending} onClick={() => save({ aboutHeading, aboutBody })}>
          {pending ? "Saving…" : "Save about"}
        </Button>
      </div>
    </Card>
  );
}

"use client";

import { useActionState, useState } from "react";
import { updateProfile, type ProfileFormState } from "@/lib/actions/profile";
import { FieldHint, FormError, Input, Label, PrimaryButton, SecondaryButton, Select, Textarea } from "./ui";

export function ProfileForm({
  initial,
  citySuggestions = [],
}: {
  initial: {
    displayName: string | null;
    city: string | null;
    bio: string | null;
    danceRole: string | null;
    wsdcNumber: number | null;
  };
  citySuggestions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    async (prev, formData) => {
      const result = await updateProfile(prev, formData);
      if (result.success) {
        setOpen(false);
        setSaved(true);
      }
      return result;
    },
    { error: null }
  );

  if (!open) {
    return (
      <div className="flex items-center gap-3">
        <SecondaryButton type="button" onClick={() => { setOpen(true); setSaved(false); }}>
          Edit profile
        </SecondaryButton>
        {saved ? <span className="font-display text-sm text-success">Profile saved.</span> : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-lg border border-line bg-panel p-5">
      <FormError error={state.error} />
      <p className="font-display text-sm text-muted">
        Everything here is optional and shown on your public profile page.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="displayName">Name</Label>
          <Input
            id="displayName"
            name="displayName"
            maxLength={60}
            defaultValue={initial.displayName ?? ""}
            placeholder="e.g. Ben D."
          />
          <FieldHint>Your edits stay credited to your username.</FieldHint>
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            maxLength={60}
            defaultValue={initial.city ?? ""}
            placeholder="e.g. Nashville, TN"
            list="profile-city-suggestions"
          />
          <datalist id="profile-city-suggestions">
            {citySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor="wsdcNumber">WSDC #</Label>
          <Input
            id="wsdcNumber"
            name="wsdcNumber"
            inputMode="numeric"
            maxLength={7}
            defaultValue={initial.wsdcNumber ?? ""}
            placeholder="e.g. 12345"
          />
          <FieldHint>Your World Swing Dance Council competitor number, if you have one.</FieldHint>
        </div>
      </div>

      <div>
        <Label htmlFor="danceRole">I dance as</Label>
        <Select id="danceRole" name="danceRole" defaultValue={initial.danceRole ?? ""}>
          <option value="">Prefer not to say</option>
          <option value="leader">Leader</option>
          <option value="follower">Follower</option>
          <option value="switch">Both / switch</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="bio">About you</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={1000}
          defaultValue={initial.bio ?? ""}
          placeholder="How long you've been dancing, your home scene, what you're working on…"
        />
      </div>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-display text-sm text-muted hover:text-ink cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

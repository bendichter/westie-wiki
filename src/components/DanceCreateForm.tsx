"use client";

import { useActionState, useRef, useState } from "react";
import { createDance, type DanceFormState } from "@/lib/actions/dances";
import { FieldHint, FormError, Input, Label, PrimaryButton, Select } from "./ui";

export function DanceCreateForm({ dancerNames }: { dancerNames: string[] }) {
  const [dancerRows, setDancerRows] = useState([0, 1]);
  const nextRow = useRef(2);
  const [songRows, setSongRows] = useState([0]);
  const nextSongRow = useRef(1);
  const [state, formAction, pending] = useActionState<DanceFormState, FormData>(createDance, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-5">
      <FormError error={state.error} />

      <div>
        <Label htmlFor="url">YouTube link</Label>
        <Input
          id="url"
          name="url"
          required
          placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…"
        />
        <FieldHint>
          One full dance — a competition heat, a demo, a social video — uploaded by the dancers
          or the event, or with the dancer&apos;s explicit permission. No workshop recaps (see
          the{" "}
          <a href="/guidelines" target="_blank" className="text-denim underline">
            guidelines
          </a>
          ). If it&apos;s already registered you&apos;ll be taken to it.
        </FieldHint>
      </div>

      <div>
        <Label>Dancers</Label>
        <div className="space-y-2">
          {dancerRows.map((rowId) => (
            <div key={rowId} className="flex gap-2">
              <div className="flex-1">
                <Input
                  name="dancerName"
                  list="dance-dancer-suggestions"
                  placeholder="Dancer name"
                  aria-label="Dancer name"
                />
              </div>
              <Select name="dancerRole" aria-label="Role" className="!w-36">
                <option value="">Role…</option>
                <option value="leader">Leader</option>
                <option value="follower">Follower</option>
              </Select>
              {dancerRows.length > 1 ? (
                <button
                  type="button"
                  aria-label="Remove dancer row"
                  onClick={() => setDancerRows((rows) => rows.filter((r) => r !== rowId))}
                  className="cursor-pointer px-2 text-muted hover:text-danger"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <datalist id="dance-dancer-suggestions">
          {dancerNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={() => setDancerRows((rows) => [...rows, nextRow.current++])}
          className="mt-2 cursor-pointer font-display text-sm text-denim hover:underline"
        >
          + Another dancer
        </button>
        <FieldHint>Every move you mark inherits these labels automatically.</FieldHint>
      </div>

      <div className="grid max-w-md grid-cols-[1fr_120px] gap-4">
        <div>
          <Label htmlFor="eventName">Event</Label>
          <Input id="eventName" name="eventName" placeholder="e.g. The US Open" />
        </div>
        <div>
          <Label htmlFor="eventYear">Year</Label>
          <Input id="eventYear" name="eventYear" placeholder="2025" inputMode="numeric" className="font-mono" />
        </div>
      </div>

      <div>
        <Label htmlFor="competition">Competition</Label>
        <Input
          id="competition"
          name="competition"
          maxLength={80}
          list="competition-suggestions"
          placeholder="e.g. Advanced Jack & Jill"
        />
        <datalist id="competition-suggestions">
          {[
            "Newcomer Jack & Jill",
            "Novice Jack & Jill",
            "Intermediate Jack & Jill",
            "Advanced Jack & Jill",
            "All-Star Jack & Jill",
            "Champions Jack & Jill",
            "Pro Jack & Jill",
            "Strictly Swing",
            "Champions Strictly Swing",
            "Classic",
            "Showcase",
            "Rising Star",
            "Pro Show",
            "Social dancing",
          ].map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <FieldHint>The division or contest this dance was part of, if any.</FieldHint>
      </div>

      <div className="max-w-48">
        <Label htmlFor="placement">Placement</Label>
        <Input
          id="placement"
          name="placement"
          maxLength={40}
          list="placement-suggestions"
          placeholder="Optional"
        />
        <datalist id="placement-suggestions">
          {["1st place", "2nd place", "3rd place", "4th place", "5th place", "Finalist", "Semifinalist"].map(
            (v) => (
              <option key={v} value={v} />
            )
          )}
        </datalist>
        <FieldHint>How this dance placed, if it was a competition.</FieldHint>
      </div>

      <div className="max-w-md">
        <Label>Songs</Label>
        <div className="space-y-2">
          {songRows.map((rowId) => (
            <div key={rowId} className="flex gap-2">
              <Input name="songName" maxLength={120} placeholder="Song" aria-label="Song" />
              <Input name="songArtist" maxLength={120} placeholder="Artist" aria-label="Artist" />
              {songRows.length > 1 ? (
                <button
                  type="button"
                  aria-label="Remove song row"
                  onClick={() => setSongRows((rows) => rows.filter((r) => r !== rowId))}
                  className="cursor-pointer px-2 text-muted hover:text-danger"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSongRows((rows) => [...rows, nextSongRow.current++])}
          className="mt-2 cursor-pointer font-display text-sm text-denim hover:underline"
        >
          + Another song
        </button>
        <FieldHint>Extended videos often play more than one song — list them in order.</FieldHint>
      </div>

      <div>
        <Label htmlFor="note">Note</Label>
        <Input id="note" name="note" maxLength={500} placeholder="e.g. Finals, second song" />
      </div>

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Registering…" : "Register and start marking"}
      </PrimaryButton>
    </form>
  );
}

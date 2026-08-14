"use client";

import { useActionState, useState } from "react";
import { deleteDance, updateDanceDetails, type AnnotationFormState } from "@/lib/actions/dances";
import { FormError, Input, PrimaryButton, Select, Textarea } from "./ui";

type DancerRow = { name: string; role: string };
type SongRow = { song: string; artist: string };

const PLACEMENT_SUGGESTIONS = [
  "1st place",
  "2nd place",
  "3rd place",
  "4th place",
  "5th place",
  "Finalist",
  "Semifinalist",
];

const fieldLabel = "mb-0.5 block font-display text-xs font-semibold text-ink-soft";

/** One panel that edits all of a dance's metadata: dancers and roles,
 * competition, placement, event, songs, and note. */
export function EditDanceDetailsForm({
  danceId,
  dancers,
  competition,
  placement,
  event,
  songs,
  note,
  eventSuggestions,
  dancerSuggestions,
  canEdit,
  canRemove = false,
}: {
  danceId: number;
  dancers: { name: string; role: string | null }[];
  competition: string | null;
  placement: string | null;
  event: { name: string; year: number | null } | null;
  songs: { song: string; artist: string }[];
  note: string | null;
  eventSuggestions: string[];
  dancerSuggestions: string[];
  canEdit: boolean;
  /** registrant or admin: may remove the dance and its timeline entirely */
  canRemove?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [dancerRows, setDancerRows] = useState<DancerRow[]>([]);
  const [songRows, setSongRows] = useState<SongRow[]>([]);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [state, formAction, pending] = useActionState<AnnotationFormState, FormData>(
    async (prev, formData) => {
      const result = await updateDanceDetails(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    { error: null }
  );

  if (!canEdit) return null;

  const openForm = () => {
    setDancerRows(
      dancers.length > 0
        ? dancers.map((d) => ({ name: d.name, role: d.role ?? "" }))
        : [{ name: "", role: "" }]
    );
    setSongRows(songs.length > 0 ? songs.map((s) => ({ ...s })) : [{ song: "", artist: "" }]);
    setConfirmingRemove(false);
    setOpen(true);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={openForm}
        className="mt-1 block cursor-pointer text-xs text-muted underline hover:text-denim"
      >
        Edit details
      </button>
    );
  }

  return (
    <div className="mt-3 max-w-2xl rounded-lg border border-line bg-panel p-4 text-left">
    <form action={formAction} className="space-y-4">
      <h2 className="font-display text-lg font-bold">Edit dance details</h2>
      <FormError error={state.error} />
      <input type="hidden" name="danceId" value={danceId} />

      <div>
        <span className={fieldLabel}>Dancers</span>
        <div className="space-y-2">
          {dancerRows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                name="dancerName"
                value={row.name}
                onChange={(e) =>
                  setDancerRows(dancerRows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))
                }
                maxLength={80}
                list="dance-dancer-suggestions"
                placeholder="Dancer name"
                aria-label={`Dancer ${i + 1} name`}
                className="min-w-0 flex-1 !py-1.5 text-sm"
              />
              <Select
                name="dancerRole"
                value={row.role}
                onChange={(e) =>
                  setDancerRows(dancerRows.map((r, j) => (j === i ? { ...r, role: e.target.value } : r)))
                }
                aria-label={`Dancer ${i + 1} role`}
                className="!w-28 shrink-0 !py-1.5 text-sm"
              >
                <option value="">no role</option>
                <option value="leader">leader</option>
                <option value="follower">follower</option>
              </Select>
              <button
                type="button"
                onClick={() => setDancerRows(dancerRows.filter((_, j) => j !== i))}
                aria-label={`Remove dancer ${i + 1}`}
                className="cursor-pointer text-muted/60 hover:text-danger"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {dancerRows.length < 6 ? (
          <button
            type="button"
            onClick={() => setDancerRows([...dancerRows, { name: "", role: "" }])}
            className="mt-1.5 cursor-pointer font-display text-xs text-denim underline underline-offset-2 hover:text-denim-deep"
          >
            + add dancer
          </button>
        ) : null}
        <datalist id="dance-dancer-suggestions">
          {dancerSuggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="edit-dance-event" className={fieldLabel}>
            Event
          </label>
          <Input
            id="edit-dance-event"
            name="eventName"
            defaultValue={event?.name ?? ""}
            maxLength={120}
            list="dance-event-suggestions"
            placeholder="e.g. The US Open"
            className="!py-1.5 text-sm"
          />
          <datalist id="dance-event-suggestions">
            {eventSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div className="w-24 shrink-0">
          <label htmlFor="edit-dance-event-year" className={fieldLabel}>
            Year
          </label>
          <Input
            id="edit-dance-event-year"
            name="eventYear"
            defaultValue={event?.year ?? ""}
            inputMode="numeric"
            maxLength={4}
            placeholder="2024"
            className="!py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-dance-competition" className={fieldLabel}>
            Competition / division
          </label>
          <Input
            id="edit-dance-competition"
            name="competition"
            defaultValue={competition ?? ""}
            maxLength={80}
            placeholder="e.g. Champions Jack & Jill"
            className="!py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="edit-dance-placement" className={fieldLabel}>
            Placement
          </label>
          <Input
            id="edit-dance-placement"
            name="placement"
            defaultValue={placement ?? ""}
            maxLength={40}
            list="dance-placement-suggestions"
            placeholder="e.g. 1st place"
            className="!py-1.5 text-sm"
          />
          <datalist id="dance-placement-suggestions">
            {PLACEMENT_SUGGESTIONS.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <span className={fieldLabel}>Songs, in play order</span>
        <div className="space-y-2">
          {songRows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                name="songName"
                value={row.song}
                onChange={(e) =>
                  setSongRows(songRows.map((r, j) => (j === i ? { ...r, song: e.target.value } : r)))
                }
                maxLength={120}
                placeholder="Song"
                aria-label={`Song ${i + 1} title`}
                className="!py-1.5 text-sm"
              />
              <Input
                name="songArtist"
                value={row.artist}
                onChange={(e) =>
                  setSongRows(songRows.map((r, j) => (j === i ? { ...r, artist: e.target.value } : r)))
                }
                maxLength={120}
                placeholder="Artist"
                aria-label={`Song ${i + 1} artist`}
                className="!py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setSongRows(songRows.filter((_, j) => j !== i))}
                aria-label={`Remove song ${i + 1}`}
                className="cursor-pointer text-muted/60 hover:text-danger"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {songRows.length < 10 ? (
          <button
            type="button"
            onClick={() => setSongRows([...songRows, { song: "", artist: "" }])}
            className="mt-1.5 cursor-pointer font-display text-xs text-denim underline underline-offset-2 hover:text-denim-deep"
          >
            + add song
          </button>
        ) : null}
      </div>

      <div>
        <label htmlFor="edit-dance-note" className={fieldLabel}>
          Note
        </label>
        <Textarea
          id="edit-dance-note"
          name="note"
          defaultValue={note ?? ""}
          maxLength={500}
          rows={2}
          placeholder="Anything worth knowing about this video"
          className="text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={pending} className="!px-4 !py-1.5">
          {pending ? "Saving…" : "Save details"}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer font-display text-sm text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>

    {canRemove ? (
      <div className="mt-4 border-t border-line pt-3">
        {confirmingRemove ? (
          <form action={deleteDance} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="danceId" value={danceId} />
            <span className="font-display text-sm text-danger">
              Remove this dance and its whole move timeline? This can&apos;t be undone.
            </span>
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-danger/40 bg-panel px-3 py-1.5 font-display text-sm font-semibold text-danger hover:bg-danger/10"
            >
              Yes, remove it
            </button>
            <button
              type="button"
              onClick={() => setConfirmingRemove(false)}
              className="cursor-pointer font-display text-sm text-muted hover:text-ink"
            >
              Keep it
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingRemove(true)}
            className="cursor-pointer font-display text-sm text-danger/80 underline underline-offset-2 hover:text-danger"
          >
            Remove this dance
          </button>
        )}
      </div>
    ) : null}
    </div>
  );
}

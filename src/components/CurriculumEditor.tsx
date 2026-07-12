"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { updateCurriculum, type CurriculumFormState } from "@/lib/actions/curricula";
import {
  FieldHint,
  FormError,
  Input,
  Label,
  PrimaryButton,
  Textarea,
} from "./ui";

export type EditorMove = { id: number; name: string; difficulty: string | null };
export type EditorVideoOption = { id: number; label: string };

type EditorItem = {
  key: number;
  moveId: number;
  notes: string;
  keyVideoIds: number[];
};

export function CurriculumEditor({
  curriculum,
  baseRevision,
  initialItems,
  movesCatalog,
  videosByMove,
}: {
  curriculum: { id: number; slug: string; title: string; description: string };
  baseRevision: number;
  initialItems: { moveId: number; notes: string; keyVideoIds: number[] }[];
  movesCatalog: EditorMove[];
  videosByMove: Record<number, EditorVideoOption[]>;
}) {
  const nextKey = useRef(initialItems.length);
  const [items, setItems] = useState<EditorItem[]>(
    initialItems.map((item, i) => ({ key: i, ...item }))
  );
  const [addQuery, setAddQuery] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<CurriculumFormState, FormData>(
    updateCurriculum,
    { error: null }
  );

  const moveById = new Map(movesCatalog.map((m) => [m.id, m]));
  const nameToMove = new Map(movesCatalog.map((m) => [m.name.toLowerCase(), m]));

  function addItem() {
    const move = nameToMove.get(addQuery.trim().toLowerCase());
    if (!move) {
      setAddError(`No move named "${addQuery}" — pick one from the suggestions.`);
      return;
    }
    if (items.some((i) => i.moveId === move.id)) {
      setAddError(`"${move.name}" is already in this curriculum.`);
      return;
    }
    setAddError(null);
    setItems((prev) => [...prev, { key: nextKey.current++, moveId: move.id, notes: "", keyVideoIds: [] }]);
    setAddQuery("");
  }

  function moveItem(index: number, delta: -1 | 1) {
    setItems((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateItem(index: number, patch: Partial<EditorItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  const itemsJson = JSON.stringify(
    items.map(({ moveId, notes, keyVideoIds }) => ({ moveId, notes, keyVideoIds }))
  );

  return (
    <form action={formAction} className="space-y-6">
      <FormError error={state.error} />
      <input type="hidden" name="curriculumId" value={curriculum.id} />
      <input type="hidden" name="baseRevision" value={baseRevision} />
      <input type="hidden" name="itemsJson" value={itemsJson} />

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required minLength={3} maxLength={100} defaultValue={curriculum.title} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={curriculum.description}
          placeholder="Who is this path for, and what will they be able to dance at the end?"
        />
      </div>

      <div>
        <Label>Moves, in learning order</Label>
        {items.length === 0 ? (
          <p className="text-sm text-muted font-display border border-dashed border-line rounded-lg px-4 py-6 text-center">
            No moves yet — add the first one below.
          </p>
        ) : (
          <ol className="space-y-3">
            {items.map((item, index) => {
              const move = moveById.get(item.moveId);
              const videoOptions = videosByMove[item.moveId] ?? [];
              return (
                <li key={item.key} className="bg-panel border border-line rounded-lg p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm text-amber font-semibold w-8">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display font-bold text-lg">{move?.name ?? "(deleted move)"}</span>
                    {move?.difficulty ? (
                      <span className="text-xs text-muted font-display">{move.difficulty}</span>
                    ) : null}
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${move?.name} up`}
                        className="border border-line rounded px-2 py-1 text-sm hover:border-denim disabled:opacity-30 cursor-pointer disabled:cursor-default"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                        aria-label={`Move ${move?.name} down`}
                        className="border border-line rounded px-2 py-1 text-sm hover:border-denim disabled:opacity-30 cursor-pointer disabled:cursor-default"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                        aria-label={`Remove ${move?.name}`}
                        className="border border-line rounded px-2 py-1 text-sm text-danger hover:border-danger ml-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Textarea
                      rows={2}
                      value={item.notes}
                      onChange={(e) => updateItem(index, { notes: e.target.value })}
                      placeholder="Notes for the learner: what to focus on, common mistakes, when it's 'good enough' to move on…"
                      aria-label={`Notes for ${move?.name}`}
                    />
                  </div>

                  {videoOptions.length > 0 ? (
                    <fieldset className="mt-3">
                      <legend className="text-xs uppercase tracking-wide text-muted font-display font-semibold mb-1.5">
                        Key example videos
                      </legend>
                      <div className="space-y-1">
                        {videoOptions.map((v) => (
                          <label key={v.id} className="flex items-start gap-2 text-sm font-display cursor-pointer">
                            <input
                              type="checkbox"
                              className="mt-1 accent-[#35507f]"
                              checked={item.keyVideoIds.includes(v.id)}
                              onChange={(e) =>
                                updateItem(index, {
                                  keyVideoIds: e.target.checked
                                    ? [...item.keyVideoIds, v.id]
                                    : item.keyVideoIds.filter((id) => id !== v.id),
                                })
                              }
                            />
                            <span className="text-ink-soft">{v.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ) : (
                    <p className="mt-3 text-xs text-muted font-display">
                      No videos on this move yet — add some on the move page to feature them here.
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-4 flex gap-2 items-start">
          <div className="flex-1">
            <Input
              value={addQuery}
              onChange={(e) => {
                setAddQuery(e.target.value);
                setAddError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
              list="curriculum-move-suggestions"
              placeholder="Add a move by name…"
              aria-label="Add a move"
            />
            <datalist id="curriculum-move-suggestions">
              {movesCatalog
                .filter((m) => !items.some((i) => i.moveId === m.id))
                .map((m) => (
                  <option key={m.id} value={m.name} />
                ))}
            </datalist>
            {addError ? (
              <p className="text-sm text-danger font-display mt-1">{addError}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="bg-panel border border-line rounded-md px-4 py-2 text-sm font-display font-semibold hover:border-denim hover:text-denim cursor-pointer"
          >
            + Add
          </button>
        </div>
        <FieldHint>
          Can&apos;t find a move?{" "}
          <Link href="/moves/new" className="text-denim underline" target="_blank">
            Document it first
          </Link>
          , then add it here.
        </FieldHint>
      </div>

      <div>
        <Label htmlFor="editSummary">Edit summary</Label>
        <Input id="editSummary" name="editSummary" maxLength={200} placeholder="What did you change, and why?" />
      </div>

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save curriculum"}
      </PrimaryButton>
    </form>
  );
}

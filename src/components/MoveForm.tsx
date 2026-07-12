"use client";

import { useActionState } from "react";
import { createMove, updateMove, type MoveFormState } from "@/lib/actions/moves";
import {
  FieldHint,
  FormError,
  Input,
  Label,
  PrimaryButton,
  Select,
  Textarea,
} from "./ui";

type MoveFormProps = {
  mode: "create" | "edit";
  initial?: {
    moveId: number;
    baseRevision: number;
    name: string;
    description: string;
    aliases: string[];
    tags: string[];
    difficulty: string | null;
  };
};

export function MoveForm({ mode, initial }: MoveFormProps) {
  const action = mode === "create" ? createMove : updateMove;
  const [state, formAction, pending] = useActionState<MoveFormState, FormData>(action, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-5">
      <FormError error={state.error} />
      {mode === "edit" && initial ? (
        <>
          <input type="hidden" name="moveId" value={initial.moveId} />
          <input type="hidden" name="baseRevision" value={initial.baseRevision} />
        </>
      ) : null}

      <div className="grid sm:grid-cols-[1fr_200px] gap-4">
        <div>
          <Label htmlFor="name">Move name</Label>
          <Input id="name" name="name" required minLength={2} maxLength={80} defaultValue={initial?.name} />
          <FieldHint>The name most dancers would recognize. Add other names below.</FieldHint>
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select id="difficulty" name="difficulty" defaultValue={initial?.difficulty ?? ""}>
            <option value="">Not set</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="aliases">Alternative names</Label>
        <Input
          id="aliases"
          name="aliases"
          placeholder="e.g. Push Break, 6-count push"
          defaultValue={initial?.aliases.join(", ")}
        />
        <FieldHint>Comma-separated. Names collide across scenes — list them all.</FieldHint>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={14}
          defaultValue={initial?.description}
          placeholder={
            "Describe the move as danced: counts, footwork, connection, common styling.\n\nMarkdown is supported — use ## headings, **bold**, and lists."
          }
        />
        <FieldHint>
          Markdown supported. Describe, don&apos;t prescribe: write what dancers actually do.
        </FieldHint>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="e.g. whip family, 8-count, spins & turns"
          defaultValue={initial?.tags.join(", ")}
        />
        <FieldHint>Comma-separated. New tags are created automatically.</FieldHint>
      </div>

      {mode === "edit" ? (
        <div>
          <Label htmlFor="editSummary">Edit summary</Label>
          <Input
            id="editSummary"
            name="editSummary"
            maxLength={200}
            placeholder="What did you change, and why?"
          />
          <FieldHint>Shown in the page history to help other editors.</FieldHint>
        </div>
      ) : null}

      <div className="pt-2">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create move" : "Save changes"}
        </PrimaryButton>
      </div>
    </form>
  );
}

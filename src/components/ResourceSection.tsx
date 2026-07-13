"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { addResource, deleteResource, type ResourceFormState } from "@/lib/actions/resources";
import { CountChip, FieldHint, FormError, Input, Label, PrimaryButton, SecondaryButton } from "./ui";

export type ResourceItem = {
  id: number;
  url: string;
  title: string;
  platform: string;
  addedBy: number;
  addedByName: string;
};

export function ResourceSection({
  moveId,
  resources,
  currentUserId,
  currentUserIsAdmin,
}: {
  moveId: number;
  resources: ResourceItem[];
  currentUserId: number | null;
  currentUserIsAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<ResourceFormState, FormData>(
    async (prev, formData) => {
      const result = await addResource(prev, formData);
      if (result.success) {
        formRef.current?.reset();
        setOpen(false);
      }
      return result;
    },
    { error: null }
  );

  return (
    <section>
      <h2 className="mb-1 text-xl font-bold">
        Learn more{" "}
        <span className="font-mono text-sm font-normal text-muted">({resources.length})</span>
      </h2>
      <p className="mb-4 font-display text-sm text-muted">
        Instructional videos and breakdowns of this move, on any platform. Citations, not
        endorsements.
      </p>

      {resources.length > 0 ? (
        <ul className="mb-4 divide-y divide-line rounded-lg border border-line bg-panel">
          {resources.map((resource) => (
            <li key={resource.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
              <CountChip>{resource.platform}</CountChip>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-display font-semibold text-denim hover:underline"
              >
                {resource.title}
              </a>
              <span className="ml-auto font-display text-xs text-muted">
                added by {resource.addedByName}
              </span>
              {currentUserId === resource.addedBy || currentUserIsAdmin ? (
                <form action={deleteResource}>
                  <input type="hidden" name="resourceId" value={resource.id} />
                  <button
                    type="submit"
                    aria-label={`Remove resource ${resource.title}`}
                    className="cursor-pointer text-xs text-danger/70 underline hover:text-danger"
                  >
                    Remove
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {currentUserId == null ? (
        <p className="font-display text-sm text-muted">
          <Link href="/login" className="text-denim underline">
            Log in
          </Link>{" "}
          to cite a tutorial.
        </p>
      ) : !open ? (
        <SecondaryButton type="button" onClick={() => setOpen(true)}>
          + Cite an instructional video
        </SecondaryButton>
      ) : (
        <form ref={formRef} action={formAction} className="space-y-3 rounded-lg border border-line bg-panel p-4">
          <FormError error={state.error} />
          <input type="hidden" name="moveId" value={moveId} />
          <div>
            <Label htmlFor="resource-url">Link</Label>
            <Input
              id="resource-url"
              name="url"
              type="url"
              required
              placeholder="https://… (YouTube, Instagram, Facebook, TikTok, anywhere)"
            />
          </div>
          <div>
            <Label htmlFor="resource-title">Title</Label>
            <Input
              id="resource-title"
              name="title"
              required
              minLength={3}
              maxLength={120}
              placeholder="e.g. Robert Royston's whip timing breakdown"
            />
            <FieldHint>Say who teaches it and what it covers.</FieldHint>
          </div>
          <div className="flex items-center gap-3">
            <PrimaryButton type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add citation"}
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
      )}
    </section>
  );
}

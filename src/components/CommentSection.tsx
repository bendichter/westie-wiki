"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { addComment, deleteComment, type CommentFormState } from "@/lib/actions/community";
import { FormError, PrimaryButton, Textarea } from "./ui";

type CommentItem = {
  id: number;
  body: string;
  createdAt: number;
  userId: number;
  username: string;
  timeAgoLabel: string;
};

export function CommentSection({
  moveId,
  comments,
  currentUserId,
}: {
  moveId: number;
  comments: CommentItem[];
  currentUserId: number | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<CommentFormState, FormData>(addComment, {
    error: null,
  });

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <section>
      <h2 className="text-xl font-bold mb-1">Discussion</h2>
      <p className="text-sm text-muted font-display mb-4">
        Debate naming, technique, and history here — keep the page itself descriptive.
      </p>

      {comments.length > 0 ? (
        <ul className="space-y-3 mb-5">
          {comments.map((c) => (
            <li key={c.id} className="bg-panel border border-line rounded-lg px-4 py-3">
              <div className="flex items-baseline gap-2 text-sm font-display">
                <span className="font-bold text-ink">{c.username}</span>
                <span className="text-muted text-xs">{c.timeAgoLabel}</span>
                {currentUserId === c.userId ? (
                  <form action={deleteComment} className="ml-auto">
                    <input type="hidden" name="commentId" value={c.id} />
                    <button
                      type="submit"
                      className="text-xs text-danger/70 hover:text-danger underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </form>
                ) : null}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[15px]">{c.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-sm font-display mb-5">No comments yet.</p>
      )}

      {currentUserId ? (
        <form ref={formRef} action={formAction} className="space-y-3">
          <FormError error={state.error} />
          <input type="hidden" name="moveId" value={moveId} />
          <Textarea
            name="body"
            rows={3}
            required
            maxLength={5000}
            placeholder="Add to the discussion…"
            aria-label="Comment"
          />
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Posting…" : "Post comment"}
          </PrimaryButton>
        </form>
      ) : (
        <p className="text-sm text-muted font-display">
          <Link href="/login" className="text-denim underline">
            Log in
          </Link>{" "}
          to join the discussion.
        </p>
      )}
    </section>
  );
}

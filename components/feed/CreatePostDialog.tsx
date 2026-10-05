"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Smile, Video } from "lucide-react";
import {
  type MemorialPostType,
  useFeed,
} from "@/components/feed/FeedContext";
import type { PostAttachment } from "@/types/postAttachments";

const TYPE_OPTIONS: { value: MemorialPostType; label: string; hint: string }[] = [
  { value: "memory", label: "Memory", hint: "A personal moment" },
  { value: "tribute", label: "Tribute", hint: "Honor their life" },
  { value: "condolence", label: "Condolence", hint: "Comfort & sympathy" },
];

const EMOJI_GRID: string[] = [
  "😀","😢","🙏","❤️","✨","🕯️","🌹","🌷","🕊️","💐",
  "😇","🤗","💖","💔","👋","🫂","☀️","🌈","🌸","🌿",
  "🎂","📷","🎵","✍️","📖","⏳","🌙","⭐","🦋","🤍",
  "😌","🥹","🙌","👏","💫","🕰️","🪦","📝",
];

function insertTextInTextarea(
  el: HTMLTextAreaElement,
  insert: string,
  setter: (next: string) => void,
) {
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  const val = el.value;
  const next = val.slice(0, start) + insert + val.slice(end);
  setter(next);
  requestAnimationFrame(() => {
    el.focus();
    const caret = start + insert.length;
    el.setSelectionRange(caret, caret);
  });
}

type PendingFile = {
  id: string;
  kind: "image" | "video";
  file: File;
  previewUrl: string;
};

function TypeDropdown({
  value,
  onChange,
}: {
  value: MemorialPostType;
  onChange: (v: MemorialPostType) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const selected = TYPE_OPTIONS.find((o) => o.value === value)!;

  return (
    <div className="relative" ref={rootRef}>
      <span id="create-post-type-label" className="sr-only">
        Post type
      </span>
      <button
        type="button"
        id="create-post-type"
        aria-labelledby="create-post-type-label"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200/90 bg-gradient-to-b from-white to-gray-50/90 px-3 py-2 text-left text-sm text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none ring-gray-900/10 transition hover:border-gray-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] focus-visible:border-gray-900 focus-visible:ring-2"
      >
        <span className="min-w-0">
          <span className="block font-medium leading-tight">{selected.label}</span>
          <span className="block text-xs font-normal text-gray-500">
            {selected.hint}
          </span>
        </span>
        <span
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg shadow-gray-900/10 ring-1 ring-black/[0.03]"
        >
          {TYPE_OPTIONS.map((o) => {
            const isActive = o.value === value;
            return (
              <li key={o.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium leading-tight">{o.label}</span>
                  <span
                    className={`text-xs leading-tight ${
                      isActive ? "text-white/75" : "text-gray-500"
                    }`}
                  >
                    {o.hint}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function CreatePostDialog() {
  const { createDialogOpen, closeCreateDialog, publishPost } = useFeed();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<MemorialPostType>("memory");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function revokeAllPreviews(items: PendingFile[]) {
    for (const p of items) {
      URL.revokeObjectURL(p.previewUrl);
    }
  }

  useEffect(() => {
    if (!createDialogOpen) return;
    const t = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [createDialogOpen]);

  useEffect(() => {
    if (!createDialogOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCreateDialog();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [createDialogOpen, closeCreateDialog]);

  function resetAndClose() {
    setContent("");
    setPostType("memory");
    setError(null);
    setSubmitting(false);
    setEmojiOpen(false);
    setPendingFiles((prev) => {
      revokeAllPreviews(prev);
      return [];
    });
    closeCreateDialog();
  }

  function addPendingFile(file: File, kind: "image" | "video") {
    if (pendingFiles.length >= 10) {
      setError("You can add at most 10 photos or videos.");
      return;
    }
    const id = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);
    setPendingFiles((prev) => [...prev, { id, kind, file, previewUrl }]);
    setError(null);
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    addPendingFile(file, "image");
  }

  function onPickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    addPendingFile(file, "video");
  }

  function removePending(id: string) {
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function uploadPendingFiles(): Promise<PostAttachment[]> {
    const uploaded: PostAttachment[] = [];
    for (const p of pendingFiles) {
      const body = new FormData();
      body.append("file", p.file);
      const res = await fetch("/api/posts/upload", {
        method: "POST",
        body,
      });
      const data = (await res.json().catch(() => ({}))) as {
        attachment?: PostAttachment;
        error?: string;
      };
      if (!res.ok || !data.attachment) {
        throw new Error(data.error ?? "Could not upload media.");
      }
      uploaded.push(data.attachment);
    }
    return uploaded;
  }

  async function handlePost() {
    const trimmed = content.trim();
    if (!trimmed && pendingFiles.length === 0) return;
    setError(null);
    setSubmitting(true);
    try {
      const attachments =
        pendingFiles.length > 0 ? await uploadPendingFiles() : [];
      await publishPost(postType, content, attachments);
      resetAndClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish post.");
      setSubmitting(false);
    }
  }

  if (!createDialogOpen) return null;

  const canPost =
    (content.trim().length > 0 || pendingFiles.length > 0) && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40"
        onClick={resetAndClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="relative w-full max-w-[min(100%,28rem)] rounded-2xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-900/15"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2
            id="create-post-title"
            className="text-base font-semibold tracking-tight text-gray-900"
          >
            New post
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-gray-500">
          Add text, emoji, photos, or videos. Shared with everyone until you delete
          it.
        </p>

        <div className="mb-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Type
          </span>
          <TypeDropdown value={postType} onChange={setPostType} />
        </div>

        <div className="mb-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={onPickImage}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={onPickVideo}
          />
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gray-50/50 px-2 py-1.5">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white hover:text-gray-900"
              aria-label="Add photo"
            >
              <ImagePlus className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white hover:text-gray-900"
              aria-label="Add video"
            >
              <Video className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setEmojiOpen((o) => !o)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white ${
                emojiOpen ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label="Insert emoji"
              aria-expanded={emojiOpen}
            >
              <Smile className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          {emojiOpen && (
            <div
              className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
              role="list"
            >
              <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
                {EMOJI_GRID.map((em) => (
                  <button
                    key={em}
                    type="button"
                    className="flex h-9 items-center justify-center rounded-md text-lg hover:bg-gray-100"
                    onClick={() => {
                      const el = textareaRef.current;
                      if (el) insertTextInTextarea(el, em, setContent);
                      setEmojiOpen(false);
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label
            htmlFor="create-post-body"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
          >
            Message
          </label>
          <textarea
            ref={textareaRef}
            id="create-post-body"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something…"
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/15"
          />
        </div>

        {pendingFiles.length > 0 && (
          <ul className="mb-3 flex flex-col gap-2">
            {pendingFiles.map((p) => (
              <li
                key={p.id}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
              >
                {p.kind === "image" ? (
                  <img
                    src={p.previewUrl}
                    alt=""
                    className="max-h-40 w-full object-contain"
                  />
                ) : (
                  <video
                    src={p.previewUrl}
                    controls
                    className="max-h-40 w-full object-contain"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removePending(p.id)}
                  className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-xs text-white hover:bg-black/70"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={!canPost}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-35"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

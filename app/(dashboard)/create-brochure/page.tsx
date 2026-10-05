"use client";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import BrochurePreview from "@/components/brochure/BrochurePreview";
import { parseJsonResponse } from "@/lib/api/parseJsonResponse";
import {
  clearBrochureDraft,
  loadBrochureDraft,
  saveBrochureDraft,
} from "@/lib/brochureStorage";
import type { BrochureDraft, BrochureSection } from "@/types/brochure";

function DraggableSection({
  section,
  updateSection,
}: {
  section: BrochureSection;
  updateSection: (
    id: string,
    field: "title" | "content",
    value: string,
  ) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="border rounded-lg p-4 space-y-2 bg-white"
    >
      <div {...listeners} className="cursor-grab text-xs text-gray-400 mb-1">
        ☰ Drag to reorder
      </div>

      <input
        type="text"
        placeholder="Section title (e.g. Order of Service)"
        value={section.title}
        onChange={(e) => updateSection(section.id, "title", e.target.value)}
        className="w-full border rounded p-2 font-medium"
      />

      <textarea
        placeholder="Enter content for this section..."
        value={section.content}
        onChange={(e) => updateSection(section.id, "content", e.target.value)}
        rows={4}
        className="w-full border rounded p-2"
      />
    </div>
  );
}

function CreateBrochurePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [dod, setDod] = useState("");
  const [bio, setBio] = useState("");
  const [sections, setSections] = useState<BrochureSection[]>([]);
  const [privacy, setPrivacy] = useState<"public" | "family">("public");
  const [accessCode, setAccessCode] = useState("");
  const [publishedId, setPublishedId] = useState<string | null>(editId);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(Boolean(editId));

  const loadExisting = useCallback(async (id: string) => {
    setLoadingEdit(true);
    setPublishError(null);
    try {
      const res = await fetch(`/api/brochures/${id}`, { cache: "no-store" });
      const data = await parseJsonResponse<{
        brochure?: BrochureDraft;
        error?: string;
      }>(res);
      if (!res.ok || !data.brochure) {
        throw new Error(data.error ?? "Could not load brochure.");
      }
      const b = data.brochure;
      setName(b.name);
      setDob(b.dob);
      setDod(b.dod);
      setBio(b.bio);
      setSections(b.sections);
      setPrivacy(b.privacy);
      setAccessCode(b.accessCode ?? "");
      setPublishedId(b.id);
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "Could not load brochure.");
    } finally {
      setLoadingEdit(false);
    }
  }, []);

  useEffect(() => {
    if (editId) {
      void loadExisting(editId);
      return;
    }

    const saved = loadBrochureDraft();
    if (!saved) return;

    setName(saved.name ?? "");
    setDob(saved.dob ?? "");
    setDod(saved.dod ?? "");
    setBio(saved.bio ?? "");
    setSections(saved.sections ?? []);
    setPrivacy(saved.privacy === "family" ? "family" : "public");
    setAccessCode(saved.accessCode ?? "");
    if (saved.id && saved.id !== "draft-001" && saved.id !== "draft-local") {
      setPublishedId(saved.id);
    }
  }, [editId, loadExisting]);

  const draftId = publishedId ?? "draft-local";

  useEffect(() => {
    const draft: BrochureDraft = {
      id: draftId,
      name,
      dob,
      dod,
      bio,
      sections,
      privacy,
      accessCode: privacy === "family" ? accessCode : undefined,
      updatedAt: new Date().toISOString(),
    };
    saveBrochureDraft(draft);
  }, [draftId, name, dob, dod, bio, sections, privacy, accessCode]);

  function addSection() {
    setSections([
      ...sections,
      { id: crypto.randomUUID(), title: "", content: "" },
    ]);
  }

  function updateSection(
    id: string,
    field: "title" | "content",
    value: string,
  ) {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  async function publishBrochure() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setPublishError("Enter the full name of the deceased.");
      return;
    }
    if (privacy === "family" && !accessCode.trim()) {
      setPublishError("Set an access code for family-only brochures.");
      return;
    }

    setPublishing(true);
    setPublishError(null);

    const payload = {
      name: trimmedName,
      dob,
      dod,
      bio,
      sections,
      privacy,
      accessCode: privacy === "family" ? accessCode : undefined,
    };

    try {
      const isUpdate = Boolean(publishedId);
      const res = await fetch(
        isUpdate ? `/api/brochures/${publishedId}` : "/api/brochures",
        {
          method: isUpdate ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await parseJsonResponse<{
        brochure?: BrochureDraft;
        error?: string;
      }>(res);
      if (!res.ok || !data.brochure) {
        throw new Error(data.error ?? "Could not save brochure.");
      }

      setPublishedId(data.brochure.id);
      saveBrochureDraft(data.brochure);
      router.replace(`/create-brochure?id=${data.brochure.id}`);
    } catch (e) {
      setPublishError(
        e instanceof Error ? e.message : "Could not publish brochure.",
      );
    } finally {
      setPublishing(false);
    }
  }

  function startNewBrochure() {
    clearBrochureDraft();
    setName("");
    setDob("");
    setDod("");
    setBio("");
    setSections([]);
    setPrivacy("public");
    setAccessCode("");
    setPublishedId(null);
    setPublishError(null);
    router.replace("/create-brochure");
  }

  if (loadingEdit) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-gray-500">
        Loading brochure…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Create Memorial Brochure</h1>
            <p className="mt-1 text-sm text-gray-500">
              Design a printable tribute with an embossed Euloges mark — secure hosting
              and a shareable memorial link.
            </p>
          </div>
          {publishedId && (
            <button
              type="button"
              onClick={startNewBrochure}
              className="text-sm text-gray-600 underline-offset-2 hover:underline"
            >
              New brochure
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Full name of deceased</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Date of Death</label>
            <input
              type="date"
              value={dod}
              onChange={(e) => setDod(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Short Biography</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border rounded-lg p-2"
            placeholder="Brief life story..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="font-semibold">Privacy</h2>
        <select
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value as "public" | "family")}
          className="w-full border rounded p-2"
        >
          <option value="public">Public (anyone can view)</option>
          <option value="family">Family only (access code)</option>
        </select>
        {privacy === "family" && (
          <input
            placeholder="Access code (share with family)"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="w-full border rounded p-2"
          />
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Brochure Sections</h2>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event;
            if (over && active.id !== over.id) {
              setSections((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
              });
            }
          }}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sections.map((section) => (
                <DraggableSection
                  key={section.id}
                  section={section}
                  updateSection={updateSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button
          type="button"
          onClick={addSection}
          className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
        >
          + Add Section
        </button>
      </div>

      {publishError && (
        <p className="text-sm text-red-700" role="alert">
          {publishError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void publishBrochure()}
          disabled={publishing}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {publishing
            ? "Saving…"
            : publishedId
              ? "Update brochure"
              : "Create brochure"}
        </button>
        {publishedId && (
          <Link
            href={`/brochure/${publishedId}`}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
          >
            Open memorial page
          </Link>
        )}
      </div>

      <BrochurePreview
        brochureId={publishedId ?? "preview"}
        name={name}
        published={Boolean(publishedId)}
      />
    </div>
  );
}

export default function CreateBrochurePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto py-12 text-center text-gray-500">
          Loading…
        </div>
      }
    >
      <CreateBrochurePageContent />
    </Suspense>
  );
}

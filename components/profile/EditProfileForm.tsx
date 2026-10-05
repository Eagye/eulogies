"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { dateOfBirthToInputValue } from "@/lib/profile/dateOfBirth";

type EditProfileFormProps = {
  initialName: string;
  initialAvatarUrl: string | null;
  initialDateOfBirth: string | null;
  /** Inside modal — drops outer card styling. */
  embedded?: boolean;
  onSaved?: () => void;
};

export default function EditProfileForm({
  initialName,
  initialAvatarUrl,
  initialDateOfBirth,
  embedded = false,
  onSaved,
}: EditProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [dateOfBirth, setDateOfBirth] = useState(
    initialDateOfBirth ? dateOfBirthToInputValue(new Date(initialDateOfBirth)) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const initialDobInput = initialDateOfBirth
    ? dateOfBirthToInputValue(new Date(initialDateOfBirth))
    : "";

  const profileDirty =
    name.trim() !== initialName.trim() ||
    dateOfBirth !== initialDobInput ||
    avatarUrl !== initialAvatarUrl;

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setUploadingPhoto(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/users/me/avatar", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as {
        avatarUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.avatarUrl) {
        throw new Error(data.error ?? "Could not upload photo.");
      }
      setAvatarUrl(data.avatarUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function removePhoto() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: null }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not remove photo.");
      }
      setAvatarUrl(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove photo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          dateOfBirth: dateOfBirth || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save profile.");
      }
      router.refresh();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        embedded
          ? "space-y-4"
          : "mt-4 space-y-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4"
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="relative">
            <ProfileAvatar name={name || initialName} avatarUrl={avatarUrl} size="lg" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto || saving}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-white shadow-md transition hover:bg-gray-800 disabled:opacity-50"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={onPickPhoto}
          />
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto || saving}
              className="text-xs font-medium text-gray-700 underline-offset-2 hover:underline disabled:opacity-50"
            >
              {uploadingPhoto ? "Uploading…" : "Upload photo"}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => void removePhoto()}
                disabled={uploadingPhoto || saving}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                <X className="h-3 w-3" aria-hidden />
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <label
              htmlFor="profile-display-name"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Display name
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/15"
            />
          </div>

          <div>
            <label
              htmlFor="profile-dob"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Date of birth
            </label>
            <input
              id="profile-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="mt-1.5 w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/15"
            />
            <p className="mt-1 text-xs text-gray-400">
              Shown on your profile. Leave empty to hide.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || uploadingPhoto || !profileDirty}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

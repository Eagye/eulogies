"use client";

import { useEffect, useState } from "react";
import EditProfileForm from "@/components/profile/EditProfileForm";

type EditProfileDialogProps = {
  initialName: string;
  initialAvatarUrl: string | null;
  initialDateOfBirth: string | null;
  className?: string;
};

export default function EditProfileDialog({
  initialName,
  initialAvatarUrl,
  initialDateOfBirth,
  className = "",
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 sm:w-auto"
        }
      >
        Edit profile
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-dialog-title"
            className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-gray-100 bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2
                id="edit-profile-dialog-title"
                className="text-lg font-semibold text-gray-900"
              >
                Edit profile
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <EditProfileForm
              embedded
              initialName={initialName}
              initialAvatarUrl={initialAvatarUrl}
              initialDateOfBirth={initialDateOfBirth}
              onSaved={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
